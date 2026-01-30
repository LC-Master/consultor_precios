export const getIPs = (): string[] => {
    const ipsEnv = process.env.AUTHORIZED_IPS || "";
    return ipsEnv.split(",").map(ip => ip.trim()).filter(ip => ip.length > 0);
}