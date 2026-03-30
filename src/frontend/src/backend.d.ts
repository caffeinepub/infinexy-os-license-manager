import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export type LicenseId = bigint;
export interface License {
    id: bigint;
    servicePack: string;
    createdAt: bigint;
    version: string;
    licenseKey: string;
    osName: string;
}
export interface UserProfile {
    name: string;
}
export enum UserRole {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export interface backendInterface {
    addLicense(osName: string, version: string, licenseKey: string, servicePack: string): Promise<LicenseId>;
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    deleteLicense(licenseId: LicenseId): Promise<void>;
    getAllLicenses(): Promise<Array<License>>;
    getCallerUserProfile(): Promise<UserProfile | null>;
    getCallerUserRole(): Promise<UserRole>;
    getLicense(licenseId: LicenseId): Promise<License>;
    getLicenses(): Promise<Array<License>>;
    getUserProfile(user: Principal): Promise<UserProfile | null>;
    isCallerAdmin(): Promise<boolean>;
    saveCallerUserProfile(profile: UserProfile): Promise<void>;
    updateLicense(licenseId: LicenseId, osName: string, version: string, licenseKey: string, servicePack: string): Promise<void>;
}
