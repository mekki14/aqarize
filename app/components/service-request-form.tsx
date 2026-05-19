"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Dialog, DialogPopup, DialogTitle, DialogDescription, DialogTrigger } from "@/components/ui/dialog";
import { Phone, Send, CheckCircle, Loader2 } from "lucide-react";

interface ServiceRequestFormProps {
  providerId: string;
  providerName: string;
  serviceType: string;
}

export default function ServiceRequestForm({ providerId, providerName, serviceType }: ServiceRequestFormProps) {
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async () => {
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/services/request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ providerId, serviceType, message }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "فشل إرسال الطلب");
      }

      setSuccess(true);
      setTimeout(() => {
        setOpen(false);
        setSuccess(false);
        setMessage("");
      }, 1500);
    } catch (err) {
      setError(err instanceof Error ? err.message : "حدث خطأ غير متوقع");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={<Button size="lg" className="rounded-xl gap-2" />}>
        <Phone className="w-4 h-4" />
        اطلب الخدمة
      </DialogTrigger>
      <DialogPopup className="sm:max-w-md">
        <DialogTitle>طلب خدمة من {providerName}</DialogTitle>
        <DialogDescription className="space-y-4 mt-3">
          <div className="bg-muted rounded-xl p-3 text-sm">
            <span className="text-muted-foreground">نوع الخدمة: </span>
            <span className="font-medium">{serviceType}</span>
          </div>

          <div className="space-y-2">
            <Label htmlFor="request-message">رسالتك (اختياري)</Label>
            <Textarea
              id="request-message"
              placeholder="اشرح ما تحتاجه بالتفصيل..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={4}
              className="rounded-xl resize-none"
            />
          </div>

          {error && (
            <div className="rounded-lg bg-destructive/10 border border-destructive/30 px-4 py-3 text-sm text-destructive">
              {error}
            </div>
          )}

          {success && (
            <div className="rounded-lg bg-success/10 border border-success/30 px-4 py-3 text-sm text-success flex items-center gap-2">
              <CheckCircle className="w-4 h-4" />
              تم إرسال طلبك بنجاح!
            </div>
          )}
        </DialogDescription>
        <div className="flex justify-end gap-2 mt-4">
          <Button variant="outline" onClick={() => setOpen(false)} className="rounded-xl" disabled={loading}>
            إلغاء
          </Button>
          <Button onClick={handleSubmit} className="rounded-xl gap-2" disabled={loading || success}>
            {loading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Send className="w-4 h-4" />
            )}
            إرسال الطلب
          </Button>
        </div>
      </DialogPopup>
    </Dialog>
  );
}
