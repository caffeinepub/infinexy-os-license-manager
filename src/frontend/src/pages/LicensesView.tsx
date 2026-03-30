import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  ChevronLeft,
  ChevronRight,
  Eye,
  EyeOff,
  Key,
  Loader2,
  Monitor,
  Package,
  Pencil,
  Plus,
  Search,
  ShieldCheck,
  Trash2,
} from "lucide-react";
import { motion } from "motion/react";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import type { License } from "../backend";
import { LicenseModal } from "../components/LicenseModal";
import {
  useAddLicense,
  useDeleteLicense,
  useLicenses,
  useUpdateLicense,
} from "../hooks/useQueries";

const PAGE_SIZE = 10;

function maskKey(key: string): string {
  if (key.length <= 4) return key;
  return `\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022${key.slice(-4)}`;
}

function KpiCard({
  icon: Icon,
  label,
  value,
  color,
}: {
  icon: React.ElementType;
  label: string;
  value: number | string;
  color: string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-card border border-border rounded-lg p-5 shadow-card"
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1">
            {label}
          </p>
          <p className="text-[26px] font-extrabold text-foreground leading-none">
            {value}
          </p>
        </div>
        <div
          className="w-10 h-10 rounded-lg flex items-center justify-center"
          style={{ background: `${color}22` }}
        >
          <Icon className="w-5 h-5" style={{ color }} />
        </div>
      </div>
    </motion.div>
  );
}

export function LicensesView() {
  const { data: licenses = [], isLoading } = useLicenses();
  const addMutation = useAddLicense();
  const updateMutation = useUpdateLicense();
  const deleteMutation = useDeleteLicense();

  const [search, setSearch] = useState("");
  const [filterOs, setFilterOs] = useState("all");
  const [filterSp, setFilterSp] = useState("all");
  const [page, setPage] = useState(1);
  const [revealedKeys, setRevealedKeys] = useState<Set<string>>(new Set());
  const [modalOpen, setModalOpen] = useState(false);
  const [editLicense, setEditLicense] = useState<License | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<License | null>(null);

  const uniqueOsNames = useMemo(
    () => [...new Set(licenses.map((l) => l.osName))].sort(),
    [licenses],
  );
  const uniqueServicePacks = useMemo(
    () => [...new Set(licenses.map((l) => l.servicePack))].sort(),
    [licenses],
  );

  const filtered = useMemo(() => {
    return licenses.filter((l) => {
      const q = search.toLowerCase();
      const matchSearch =
        !q ||
        l.osName.toLowerCase().includes(q) ||
        l.version.toLowerCase().includes(q) ||
        l.licenseKey.toLowerCase().includes(q);
      const matchOs = filterOs === "all" || l.osName === filterOs;
      const matchSp = filterSp === "all" || l.servicePack === filterSp;
      return matchSearch && matchOs && matchSp;
    });
  }, [licenses, search, filterOs, filterSp]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const toggleKey = (id: string) => {
    setRevealedKeys((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleSave = async (data: {
    osName: string;
    version: string;
    licenseKey: string;
    servicePack: string;
  }) => {
    try {
      if (editLicense) {
        await updateMutation.mutateAsync({ id: editLicense.id, ...data });
        toast.success("License updated successfully");
      } else {
        await addMutation.mutateAsync(data);
        toast.success("License added successfully");
      }
      setModalOpen(false);
      setEditLicense(null);
    } catch {
      toast.error("Failed to save license");
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await deleteMutation.mutateAsync(deleteTarget.id);
      toast.success("License deleted");
      setDeleteTarget(null);
    } catch {
      toast.error("Failed to delete license");
    }
  };

  const activeLicenses = licenses.length;
  const uniqueSpCount = new Set(
    licenses.map((l) => l.servicePack).filter((sp) => sp !== "None"),
  ).size;
  const maskedCount = licenses.length - revealedKeys.size;

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Page header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-foreground">
            OS License Inventory
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Manage and track all your Windows OS licenses
          </p>
        </div>
        <Button
          onClick={() => {
            setEditLicense(null);
            setModalOpen(true);
          }}
          className="gap-2"
          data-ocid="license.open_modal_button"
          style={{ background: "oklch(var(--primary))", color: "white" }}
        >
          <Plus className="w-4 h-4" />
          Add New License
        </Button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard
          icon={Monitor}
          label="Total Licenses"
          value={licenses.length}
          color="#2F80ED"
        />
        <KpiCard
          icon={ShieldCheck}
          label="Active Licenses"
          value={activeLicenses}
          color="#10B981"
        />
        <KpiCard
          icon={Package}
          label="Service Packs Used"
          value={uniqueSpCount}
          color="#F59E0B"
        />
        <KpiCard
          icon={Key}
          label="Keys Masked"
          value={maskedCount}
          color="#8B5CF6"
        />
      </div>

      {/* Table Card */}
      <div
        className="bg-card border border-border rounded-lg shadow-card"
        data-ocid="license.table"
      >
        {/* Filters */}
        <div className="p-4 border-b border-border flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search licenses..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              className="pl-9"
              data-ocid="license.search_input"
            />
          </div>
          <Select
            value={filterOs}
            onValueChange={(v) => {
              setFilterOs(v);
              setPage(1);
            }}
          >
            <SelectTrigger
              className="w-full sm:w-44"
              data-ocid="license.select"
            >
              <SelectValue placeholder="Filter by OS" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All OS</SelectItem>
              {uniqueOsNames.map((os) => (
                <SelectItem key={os} value={os}>
                  {os}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select
            value={filterSp}
            onValueChange={(v) => {
              setFilterSp(v);
              setPage(1);
            }}
          >
            <SelectTrigger
              className="w-full sm:w-44"
              data-ocid="license.select"
            >
              <SelectValue placeholder="Filter by SP" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Service Packs</SelectItem>
              {uniqueServicePacks.map((sp) => (
                <SelectItem key={sp} value={sp}>
                  {sp}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/40">
                <TableHead className="text-xs font-bold uppercase tracking-wide text-muted-foreground">
                  OS Name
                </TableHead>
                <TableHead className="text-xs font-bold uppercase tracking-wide text-muted-foreground">
                  Version
                </TableHead>
                <TableHead className="text-xs font-bold uppercase tracking-wide text-muted-foreground">
                  License Key
                </TableHead>
                <TableHead className="text-xs font-bold uppercase tracking-wide text-muted-foreground">
                  Service Pack
                </TableHead>
                <TableHead className="text-xs font-bold uppercase tracking-wide text-muted-foreground text-right">
                  Actions
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  // biome-ignore lint/suspicious/noArrayIndexKey: skeleton rows have no stable id
                  <TableRow key={i}>
                    <TableCell>
                      <Skeleton className="h-4 w-32" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-4 w-20" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-4 w-40" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-4 w-16" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-4 w-20 ml-auto" />
                    </TableCell>
                  </TableRow>
                ))
              ) : paginated.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={5}
                    className="text-center py-12"
                    data-ocid="license.empty_state"
                  >
                    <div className="flex flex-col items-center gap-2 text-muted-foreground">
                      <Monitor className="w-8 h-8 opacity-40" />
                      <p className="text-sm font-medium">No licenses found</p>
                      <p className="text-xs">
                        Add a new license to get started
                      </p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                paginated.map((license, idx) => {
                  const idKey = license.id.toString();
                  const revealed = revealedKeys.has(idKey);
                  const rowNum = (page - 1) * PAGE_SIZE + idx + 1;
                  return (
                    <TableRow
                      key={idKey}
                      className="h-12"
                      data-ocid={`license.item.${rowNum}`}
                    >
                      <TableCell className="font-medium text-sm">
                        <div className="flex items-center gap-2">
                          <div className="w-1.5 h-1.5 rounded-full bg-success flex-shrink-0" />
                          {license.osName}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant="secondary"
                          className="text-xs font-mono"
                        >
                          {license.version || "\u2014"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-xs text-foreground">
                            {revealed
                              ? license.licenseKey
                              : maskKey(license.licenseKey)}
                          </span>
                          <button
                            type="button"
                            onClick={() => toggleKey(idKey)}
                            className="text-muted-foreground hover:text-foreground transition-colors"
                            aria-label={revealed ? "Hide key" : "Show key"}
                            data-ocid={`license.toggle.${rowNum}`}
                          >
                            {revealed ? (
                              <EyeOff className="w-3.5 h-3.5" />
                            ) : (
                              <Eye className="w-3.5 h-3.5" />
                            )}
                          </button>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge
                          className="text-xs"
                          style={{
                            background:
                              license.servicePack === "None"
                                ? "oklch(0.93 0.01 220)"
                                : "oklch(0.56 0.18 253 / 0.15)",
                            color:
                              license.servicePack === "None"
                                ? "oklch(0.53 0.012 250)"
                                : "oklch(0.45 0.18 253)",
                          }}
                        >
                          {license.servicePack}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-muted-foreground hover:text-foreground"
                            onClick={() => {
                              setEditLicense(license);
                              setModalOpen(true);
                            }}
                            data-ocid={`license.edit_button.${rowNum}`}
                          >
                            <Pencil className="w-3.5 h-3.5" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-muted-foreground hover:text-destructive"
                            onClick={() => setDeleteTarget(license)}
                            data-ocid={`license.delete_button.${rowNum}`}
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-border">
            <p className="text-xs text-muted-foreground">
              Showing {(page - 1) * PAGE_SIZE + 1}\u2013
              {Math.min(page * PAGE_SIZE, filtered.length)} of {filtered.length}
            </p>
            <div className="flex items-center gap-1">
              <Button
                variant="outline"
                size="icon"
                className="h-7 w-7"
                disabled={page === 1}
                onClick={() => setPage((p) => p - 1)}
                data-ocid="license.pagination_prev"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
              </Button>
              <span className="text-xs text-muted-foreground px-2">
                {page} / {totalPages}
              </span>
              <Button
                variant="outline"
                size="icon"
                className="h-7 w-7"
                disabled={page === totalPages}
                onClick={() => setPage((p) => p + 1)}
                data-ocid="license.pagination_next"
              >
                <ChevronRight className="w-3.5 h-3.5" />
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Modals */}
      <LicenseModal
        open={modalOpen}
        onClose={() => {
          setModalOpen(false);
          setEditLicense(null);
        }}
        onSave={handleSave}
        license={editLicense}
        isSaving={addMutation.isPending || updateMutation.isPending}
      />

      <AlertDialog
        open={!!deleteTarget}
        onOpenChange={(v) => !v && setDeleteTarget(null)}
      >
        <AlertDialogContent data-ocid="license.dialog">
          <AlertDialogHeader>
            <AlertDialogTitle>Delete License?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete the license for{" "}
              <strong>{deleteTarget?.osName}</strong>? This action cannot be
              undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel data-ocid="license.cancel_button">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              data-ocid="license.confirm_button"
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleteMutation.isPending ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                "Delete"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
