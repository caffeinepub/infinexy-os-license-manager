import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { License } from "../backend";
import { useActor } from "./useActor";

export function useLicenses() {
  const { actor, isFetching } = useActor();
  return useQuery<License[]>({
    queryKey: ["licenses"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getLicenses();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useAddLicense() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: {
      osName: string;
      version: string;
      licenseKey: string;
      servicePack: string;
    }) => {
      if (!actor) throw new Error("Not connected");
      return actor.addLicense(
        data.osName,
        data.version,
        data.licenseKey,
        data.servicePack,
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["licenses"] });
    },
  });
}

export function useUpdateLicense() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: {
      id: bigint;
      osName: string;
      version: string;
      licenseKey: string;
      servicePack: string;
    }) => {
      if (!actor) throw new Error("Not connected");
      return actor.updateLicense(
        data.id,
        data.osName,
        data.version,
        data.licenseKey,
        data.servicePack,
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["licenses"] });
    },
  });
}

export function useDeleteLicense() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: bigint) => {
      if (!actor) throw new Error("Not connected");
      return actor.deleteLicense(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["licenses"] });
    },
  });
}

export function useUserProfile() {
  const { actor, isFetching } = useActor();
  return useQuery({
    queryKey: ["userProfile"],
    queryFn: async () => {
      if (!actor) return null;
      return actor.getCallerUserProfile();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useSaveUserProfile() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (profile: { name: string }) => {
      if (!actor) throw new Error("Not connected");
      return actor.saveCallerUserProfile(profile);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["userProfile"] });
    },
  });
}
