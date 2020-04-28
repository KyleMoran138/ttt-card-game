import http from 'http';
import io, {Socket} from 'socket.io';
import { User } from './models/User';
import { Game } from './models/Game';

const server = http.createServer();
const socket = io(server);

const users: Map<Socket, User>  = new Map();
const sessions: Map<string, Game> = new Map();

socket.on('connection', (clientSocket) => {
    console.log(`A user connected!`);
    users.set(clientSocket, new User());

    clientSocket.on('disconnect', async ()=> {
        let user = getSocketUser(clientSocket);
        let username = user._isEmpty ? 'user' : user.nickname || 'user';
        let sessionName = user.session;
        
        
        await deleteSessionIfLastUser(clientSocket);
        users.delete(clientSocket);
        updateSessionUserList(sessionName || ``);
        console.log(`(${username}) left!`);
    });

    clientSocket.on('joinSession', (sessionName: string) => {joinSession(sessionName, clientSocket)});
    clientSocket.on('createSession', (sessionName: string)=> {createSession(sessionName, clientSocket)});
    clientSocket.on('leaveSession', ()=> {leaveSession(clientSocket)});
    clientSocket.on('updateGame', (game: Game)=> {updateGame(game, clientSocket)});
    
    clientSocket.on('setName', (nickname: string) => {setName(nickname, clientSocket)});

    clientSocket.on('listUsersInSession', ()=>{listUsersInSession(clientSocket)});
});


//Session actions
async function joinSession(sessionName: string, clientSocket: Socket): Promise<void>{
    if(!sessions.has(sessionName)){
        clientSocket.emit('joinSession', {message: "Session does not exist", status: 404});
        return;
    }

    let user = getSocketUser(clientSocket);
    user.session = sessionName;

    if(!saveUser(clientSocket, user)){
        clientSocket.emit('joinSession', {message: "Couldn't save your user?", status: 500});
        return;
    }
    clientSocket.join(sessionName);
    clientSocket.emit('joinSession', {data: user, status: 200});
    await listUsersInSession(clientSocket);
    updateSessionUserList(sessionName);
    updateGameForPlayersInSession(sessionName);
    return;
}
async function leaveSession(clientSocket: Socket): Promise<void>{
    let user = getSocketUser(clientSocket);
    if (user.session){
        clientSocket.leave(user.session);
        await deleteSessionIfLastUser(clientSocket);
        updateSessionUserList(user.session);
        delete user.session;
    }
    
    if(!saveUser(clientSocket, user)){
        clientSocket.emit('leaveSession', {message: "Couldn't save your user?", status: 500});
        return;
    }
    clientSocket.emit('leaveSession', {data: user, status: 200});
    return;
}
async function createSession(sessionName: string, clientSocket: Socket): Promise<void>{
    if(!sessionName) return;
    if(sessions.has(sessionName)){
        clientSocket.emit('createSession', {message: 'Session exists!', status: 409});
        return;
    }
    sessions.set(sessionName, new Game());
    console.log(`Session (${sessionName}) created!`);
    await deleteSessionIfLastUser(clientSocket);
    await joinSession(sessionName, clientSocket);
    return;
}
async function listUsersInSession(clientSocket: Socket): Promise<void>{
    let user = getSocketUser(clientSocket);
    if(user._isEmpty == true || !user.session){
        clientSocket.emit('listUsersInSession', {message: `You're not in a session`, status: 404});
        return;
    }
    clientSocket.emit('listUsersInSession', {
        data: getUsersInSession(user.session).map((userInSession: User) => {return userInSession.nickname}),
        status: 200
    });
    return;
}
async function updateGame(newGameData: Game, clientSocket: Socket): Promise<void>{
    let user = getSocketUser(clientSocket);
    if(user._isEmpty == true || !user.session){
        clientSocket.emit('updateGame', {message: `You're not in a session`, status: 404});
        return;
    }

    let savedGameData = sessions.get(user.session);
    // A round has started
    if(savedGameData && (!savedGameData.currentRound && newGameData.currentRound == 1) 
        || (newGameData.currentRound && savedGameData?.currentRound && savedGameData?.currentRound+1 == newGameData.currentRound) ){
            let socketsInGame: Socket[] = [];
            users.forEach((userConnectedToServer: User, userSocket: Socket) => {
                if(userConnectedToServer.session == user.session) socketsInGame.push(userSocket);
            });
            socketsInGame = shuffleArray(socketsInGame);

            let numberOfTrators = Math.floor(socketsInGame.length * savedGameData.tratorToInnocentRatio) || 1;
            let currentCountOfTrators = 0;
            socketsInGame.forEach((socketInGame: Socket) => {
                let userInGame = getSocketUser(socketInGame);
                if(currentCountOfTrators < numberOfTrators){
                    userInGame.role = "TRATOR";
                    currentCountOfTrators++;
                }else{
                    userInGame.role = "innocent";
                }
                saveUser(socketInGame, userInGame);
            });
    }

    sessions.set(user.session, newGameData);
    updateGameForPlayersInSession(user.session);
    clientSocket.emit('updateGame', {
        data: newGameData,
        status: 200
    });
    return;
}

//User actions
function setName(nickname: string, clientSocket: Socket): void{
    let user = getSocketUser(clientSocket);
    if(!nickname || user.nickname == nickname || !(nickname.trim())) return;
    console.log(`(${user.nickname || "user"}) changed their name to ${nickname}`);
    user.nickname = nickname;

    if(!saveUser(clientSocket, user)){
        clientSocket.emit('setName', {message: "Couldn't save your user?", status: 500});
        return;
    }
    updateSessionUserList(user.session || '');
    return;
}

//Helpers
function getSocketUser(clientSocket: Socket): User{
    return users.get(clientSocket) || new User(true); 
}
function saveUser(clientSocket: Socket, user: User): boolean{
    if(user._isEmpty) return false;
    users.delete(clientSocket);
    users.set(clientSocket, user);
    updateUser(clientSocket);
    return true;
}
async function deleteSessionIfLastUser(clientSocket: Socket): Promise<void>{
    let user = getSocketUser(clientSocket);
    if(user._isEmpty || !user.session){
        return;
    }
    let usersOldSessionName = user.session;
    user.session = "";
    
    
    let matchingUserIndex = Array.from(users.values()).findIndex((users: User) => {
        return users.session == usersOldSessionName;
    });

    if(matchingUserIndex != -1) return;
    sessions.delete(usersOldSessionName);
    console.log(`${usersOldSessionName} was disbanded!`);
    return;
}
function getUsersInSession(sessionName: string): User[]{
    let matchingUsersInSession = Array.from(users.values()).filter((user: User) => {
        return user.session == sessionName;
    });
    return matchingUsersInSession || [];
}
function updateSessionUserList(sessionName: string){
    if(!sessionName || !sessions.has(sessionName)) return;
    socket.to(sessionName).emit('listUsersInSession', {
        data: getUsersInSession(sessionName).map((userInSession: User) => {return userInSession.nickname}),
        status: 200
    });
}
async function getSessionGame(sessionName: string): Promise<Game>{
    if(!sessionName || !sessions.has(sessionName)) return new Game(true);
    return sessions.get(sessionName) || new Game(true);
}
function updateGameForPlayersInSession(sessionName: string): void{
    if(!sessionName || !sessions.has(sessionName)) return;

    socket.to(sessionName).emit('updateGame', {
        data: sessions.get(sessionName),
        status: 200,
    });
}
function shuffleArray(array: any[]): any[]{

    for (let i = array.length - 1; i >= 0; i--) {

        let randomIndex = Math.floor(Math.random() * (i + 1));
        let itemAtIndex = array[randomIndex];

        array[randomIndex] = array[i];
        array[i] = itemAtIndex;
    }

    return array;
}
function updateUser(clientSocket: Socket): void{
    clientSocket.emit('updateUser', {
        status: 200,
        data: users.get(clientSocket),
    });
}

//Start the server
server.listen(process.env.PORT || 8080, ()=>{
    console.log(`Listening on *:${process.env.PORT || 8080}`)
})

