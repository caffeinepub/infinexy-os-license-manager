import Iter "mo:core/Iter";
import Order "mo:core/Order";
import Map "mo:core/Map";
import Time "mo:core/Time";
import Nat "mo:core/Nat";
import Array "mo:core/Array";
import Runtime "mo:core/Runtime";
import Principal "mo:core/Principal";
import Text "mo:core/Text";
import AccessControl "authorization/access-control";
import MixinAuthorization "authorization/MixinAuthorization";

actor {
  // Initialize the access control system
  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);

  // User Profile type as required by instructions
  public type UserProfile = {
    name : Text;
  };

  let userProfiles = Map.empty<Principal, UserProfile>();

  public query ({ caller }) func getCallerUserProfile() : async ?UserProfile {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view profiles");
    };
    userProfiles.get(caller);
  };

  public query ({ caller }) func getUserProfile(user : Principal) : async ?UserProfile {
    if (caller != user and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own profile");
    };
    userProfiles.get(user);
  };

  public shared ({ caller }) func saveCallerUserProfile(profile : UserProfile) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can save profiles");
    };
    userProfiles.add(caller, profile);
  };

  // License Management Types
  type LicenseId = Nat;

  public type License = {
    id : Nat;
    osName : Text;
    version : Text;
    licenseKey : Text;
    servicePack : Text;
    createdAt : Int;
  };

  module License {
    public func compare(license1 : License, license2 : License) : Order.Order {
      Nat.compare(license1.id, license2.id);
    };
  };

  type LicenseKey = {
    owner : Principal;
    licenseId : LicenseId;
  };

  module LicenseKey {
    public func compare(key1 : LicenseKey, key2 : LicenseKey) : Order.Order {
      switch (Principal.compare(key1.owner, key2.owner)) {
        case (#equal) { Nat.compare(key1.licenseId, key2.licenseId) };
        case (order) { order };
      };
    };
  };

  let licenses = Map.empty<LicenseKey, License>();
  var nextLicenseId : Nat = 1;

  // License CRUD operations - all require user permission
  public shared ({ caller }) func addLicense(
    osName : Text,
    version : Text,
    licenseKey : Text,
    servicePack : Text
  ) : async LicenseId {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can add licenses");
    };

    let licenseId = nextLicenseId;
    nextLicenseId += 1;

    let licenseKeyRecord : LicenseKey = {
      owner = caller;
      licenseId;
    };

    let newLicense : License = {
      id = licenseId;
      osName;
      version;
      licenseKey;
      servicePack;
      createdAt = Time.now();
    };

    licenses.add(licenseKeyRecord, newLicense);
    licenseId;
  };

  public shared ({ caller }) func updateLicense(
    licenseId : LicenseId,
    osName : Text,
    version : Text,
    licenseKey : Text,
    servicePack : Text
  ) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can update licenses");
    };

    let licenseKeyRecord : LicenseKey = {
      owner = caller;
      licenseId;
    };

    switch (licenses.get(licenseKeyRecord)) {
      case (null) { Runtime.trap("License not found or you don't own it") };
      case (?existingLicense) {
        let updatedLicense : License = {
          id = licenseId;
          osName;
          version;
          licenseKey;
          servicePack;
          createdAt = existingLicense.createdAt;
        };
        licenses.add(licenseKeyRecord, updatedLicense);
      };
    };
  };

  public shared ({ caller }) func deleteLicense(licenseId : LicenseId) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can delete licenses");
    };

    let licenseKeyRecord : LicenseKey = {
      owner = caller;
      licenseId;
    };

    if (not licenses.containsKey(licenseKeyRecord)) {
      Runtime.trap("License not found or you don't own it");
    };

    licenses.remove(licenseKeyRecord);
  };

  public query ({ caller }) func getLicense(licenseId : LicenseId) : async License {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view licenses");
    };

    let licenseKeyRecord : LicenseKey = {
      owner = caller;
      licenseId;
    };

    switch (licenses.get(licenseKeyRecord)) {
      case (null) { Runtime.trap("License not found or you don't own it") };
      case (?license) { license };
    };
  };

  public query ({ caller }) func getLicenses() : async [License] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view licenses");
    };

    let userLicenses = licenses.toArray().filter(
      func((key, _)) { key.owner == caller }
    );

    let sortedEntries = userLicenses.sort(
      func((k1, _), (k2, _)) { LicenseKey.compare(k1, k2) }
    );

    sortedEntries.map(func((_, l)) { l });
  };

  // Admin function to view all licenses (example of admin-only function)
  public query ({ caller }) func getAllLicenses() : async [License] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can view all licenses");
    };

    let allLicenses = licenses.toArray();
    let sortedEntries = allLicenses.sort(
      func((k1, _), (k2, _)) { LicenseKey.compare(k1, k2) }
    );

    sortedEntries.map(func((_, l)) { l });
  };
};
