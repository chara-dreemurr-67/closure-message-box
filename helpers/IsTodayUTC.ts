export default (Timestamp: number): boolean => {
    const D: Date = new Date(Timestamp);
    const Now: Date = new Date();

    return (
        D.getUTCFullYear() === Now.getUTCFullYear() &&
        D.getUTCMonth() === Now.getUTCMonth() &&
        D.getUTCDate() === Now.getUTCDate()
    );
};