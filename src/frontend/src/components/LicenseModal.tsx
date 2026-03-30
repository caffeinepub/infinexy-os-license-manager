import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import type { License } from "../backend";

const OS_VERSIONS = [
  "Windows 1.0",
  "Windows 2.0",
  "Windows 3.0",
  "Windows 3.1",
  "Windows 95",
  "Windows 98",
  "Windows ME",
  "Windows NT 3.1",
  "Windows NT 3.5",
  "Windows NT 4.0",
  "Windows 2000",
  "Windows XP",
  "Windows Vista",
  "Windows 7",
  "Windows 8",
  "Windows 8.1",
  "Windows 10",
  "Windows 11",
];

const SERVICE_PACKS = ["None", "SP1", "SP2", "SP3"];

interface LicenseModalProps {
  open: boolean;
  onClose: () => void;
  onSave: (data: {
    osName: string;
    version: string;
    licenseKey: string;
    servicePack: string;
  }) => Promise<void>;
  license?: License | null;
  isSaving?: boolean;
}

export function LicenseModal({
  open,
  onClose,
  onSave,
  license,
  isSaving,
}: LicenseModalProps) {
  const [osName, setOsName] = useState("");
  const [version, setVersion] = useState("");
  const [licenseKey, setLicenseKey] = useState("");
  const [servicePack, setServicePack] = useState("None");

  useEffect(() => {
    if (license) {
      setOsName(license.osName);
      setVersion(license.version);
      setLicenseKey(license.licenseKey);
      setServicePack(license.servicePack);
    } else {
      setOsName("");
      setVersion("");
      setLicenseKey("");
      setServicePack("None");
    }
  }, [license]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!osName || !version || !licenseKey) return;
    await onSave({ osName, version, licenseKey, servicePack });
  };

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="sm:max-w-md" data-ocid="license.dialog">
        <DialogHeader>
          <DialogTitle>
            {license ? "Edit License" : "Add New License"}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 py-2">
          <div className="space-y-1.5">
            <Label htmlFor="os-name">OS Name</Label>
            <Select value={osName} onValueChange={setOsName}>
              <SelectTrigger id="os-name" data-ocid="license.select">
                <SelectValue placeholder="Select Windows version" />
              </SelectTrigger>
              <SelectContent>
                {OS_VERSIONS.map((v) => (
                  <SelectItem key={v} value={v}>
                    {v}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="version">Version / Build</Label>
            <Input
              id="version"
              placeholder="e.g., 22H2, 21H1"
              value={version}
              onChange={(e) => setVersion(e.target.value)}
              data-ocid="license.input"
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="license-key">License Key</Label>
            <Input
              id="license-key"
              placeholder="XXXXX-XXXXX-XXXXX-XXXXX-XXXXX"
              value={licenseKey}
              onChange={(e) => setLicenseKey(e.target.value)}
              data-ocid="license.input"
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="service-pack">Service Pack</Label>
            <Select value={servicePack} onValueChange={setServicePack}>
              <SelectTrigger id="service-pack" data-ocid="license.select">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {SERVICE_PACKS.map((sp) => (
                  <SelectItem key={sp} value={sp}>
                    {sp}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <DialogFooter className="pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              data-ocid="license.cancel_button"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSaving || !osName || !version || !licenseKey}
              data-ocid="license.save_button"
            >
              {isSaving ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" /> Saving...
                </>
              ) : (
                "Save License"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
