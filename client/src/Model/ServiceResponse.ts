export class ServiceResponse<T>{
    status: number;
    data: T;
    message?: string;
}