"use client";

import { useState } from "react";
import { Users, Clock, Eye, CheckCircle, Phone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogPopup, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

interface Lead {
  id: number;
  name: string;
  email: string;
  service: string;
  message: string;
  status: "new" | "contacted" | "closed" | "cancelled";
  date: string;
}

const statusConfig: Record<string, { label: string; color: string; icon: typeof Clock }> = {
  new: { label: "جديد", color: "bg-info/10 text-info", icon: Clock },
  contacted: { label: "تم التواصل", color: "bg-warning/10 text-warning", icon: Eye },
  closed: { label: "مغلق", color: "bg-success/10 text-success", icon: CheckCircle },
  cancelled: { label: "ملغي", color: "bg-destructive/10 text-destructive", icon: Clock },
};

function formatDate(iso: string) {
  return new Intl.DateTimeFormat("ar-DZ", { year: "numeric", month: "short", day: "numeric" }).format(new Date(iso));
}

export default function ProviderLeadsClient({ initialLeads }: { initialLeads: Lead[] }) {
  const [leads, setLeads] = useState<Lead[]>(initialLeads);
  const [filter, setFilter] = useState("all");
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const [updating, setUpdating] = useState<number | null>(null);

  const filteredLeads = filter === "all" ? leads : leads.filter((l) => l.status === filter);

  const updateStatus = async (id: number, status: Lead["status"]) => {
    setUpdating(id);
    try {
      const res = await fetch("/api/services/leads", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, status }),
      });
      if (res.ok) {
        setLeads((prev) => prev.map((l) => (l.id === id ? { ...l, status } : l)));
      }
    } finally {
      setUpdating(null);
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold">طلبات الخدمة</h1>
          <p className="text-sm text-muted-foreground mt-1">إدارة طلبات العملاء على خدماتك</p>
        </div>
        <div className="flex items-center gap-2">
          {[
            { value: "all", label: "الكل" },
            { value: "new", label: "جديد" },
            { value: "contacted", label: "تم التواصل" },
            { value: "closed", label: "مغلق" },
          ].map((f) => (
            <button key={f.value} onClick={() => setFilter(f.value)} className={cn("px-3 py-1.5 rounded-lg text-xs font-medium transition-colors", filter === f.value ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-muted")}>
              {f.label}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-3">
        {filteredLeads.map((lead) => {
          const config = statusConfig[lead.status] || statusConfig.new;
          const Icon = config.icon;
          return (
            <div key={lead.id} onClick={() => { setSelectedLead(lead); setDetailOpen(true); }} className="bg-card rounded-2xl border border-border/40 p-4 sm:p-5 shadow-sm hover:shadow-md transition-all cursor-pointer">
              <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                  <Users className="w-5 h-5 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2 mb-1">
                    <h3 className="font-bold text-sm">{lead.name}</h3>
                    <Badge variant="secondary" className={cn("text-xs", config.color)}>
                      <Icon className="w-3 h-3 ml-1" />
                      {config.label}
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground mb-1">{lead.service}</p>
                  <p className="text-sm text-foreground truncate">{lead.message}</p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <span className="text-xs text-muted-foreground whitespace-nowrap">{formatDate(lead.date)}</span>
                  {lead.status === "new" && (
                    <Button size="sm" className="rounded-xl" disabled={updating === lead.id} onClick={(e) => { e.stopPropagation(); updateStatus(lead.id, "contacted"); }}>
                      <Phone className="w-3 h-3 ml-1" />
                      تواصل
                    </Button>
                  )}
                  {lead.status === "contacted" && (
                    <Button size="sm" variant="outline" className="rounded-xl" disabled={updating === lead.id} onClick={(e) => { e.stopPropagation(); updateStatus(lead.id, "closed"); }}>
                      <CheckCircle className="w-3 h-3 ml-1" />
                      إغلاق
                    </Button>
                  )}
                </div>
              </div>
            </div>
          );
        })}

        {filteredLeads.length === 0 && (
          <div className="bg-card rounded-2xl border border-border/40 p-12 text-center">
            <p className="text-muted-foreground">لا توجد طلبات بهذا التصنيف</p>
          </div>
        )}
      </div>

      <Dialog open={detailOpen} onOpenChange={setDetailOpen}>
        <DialogPopup className="sm:max-w-lg">
          {selectedLead && (
            <>
              <DialogTitle>تفاصيل الطلب</DialogTitle>
              <DialogDescription className="space-y-4 mt-2">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-muted-foreground text-xs">العميل</p>
                    <p className="font-medium">{selectedLead.name}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground text-xs">الخدمة</p>
                    <p className="font-medium">{selectedLead.service}</p>
                  </div>
                  <div className="col-span-2">
                    <p className="text-muted-foreground text-xs">البريد</p>
                    <p className="font-medium">{selectedLead.email}</p>
                  </div>
                </div>
                <div>
                  <p className="text-muted-foreground text-xs mb-1">الرسالة</p>
                  <div className="bg-muted rounded-xl p-3 text-sm">{selectedLead.message}</div>
                </div>
              </DialogDescription>
              <div className="flex justify-end gap-2 mt-4">
                <Button variant="outline" onClick={() => setDetailOpen(false)} className="rounded-xl">إغلاق</Button>
                {selectedLead.status === "new" && (
                  <Button className="rounded-xl" onClick={() => { updateStatus(selectedLead.id, "contacted"); setDetailOpen(false); }}>
                    <Phone className="w-4 h-4 ml-1" />
                    تواصل
                  </Button>
                )}
                {selectedLead.status === "contacted" && (
                  <Button variant="outline" className="rounded-xl" onClick={() => { updateStatus(selectedLead.id, "closed"); setDetailOpen(false); }}>
                    <CheckCircle className="w-4 h-4 ml-1" />
                    إغلاق الطلب
                  </Button>
                )}
              </div>
            </>
          )}
        </DialogPopup>
      </Dialog>
    </div>
  );
}
