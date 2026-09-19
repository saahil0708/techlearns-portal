declare const _default: () => {
    nodeEnv: string;
    port: number;
    database: {
        url: string | undefined;
    };
    jwt: {
        secret: string | undefined;
        expiresIn: string;
    };
    auth: {
        totp: {
            encryptionKey: string | undefined;
            previousEncryptionKeys: string[] | undefined;
        };
    };
    redis: {
        host: string;
        port: number;
        password: string | undefined;
    };
    judge: {
        queueName: string;
        image: string | undefined;
    };
    mail: {
        host: string;
        port: number;
        secure: boolean;
        user: string | undefined;
        pass: string | undefined;
        from: string;
        devMode: boolean;
    };
};
export default _default;
