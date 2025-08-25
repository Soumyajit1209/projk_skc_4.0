import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { CreditCard, FileText, Clock, Eye, CheckCircle, XCircle } from "lucide-react"
import { Payment } from "./types"

interface PaymentListProps {
  payments: Payment[]
  loadingPayments: boolean
  setPaymentDialog: (dialog: {
    open: boolean
    payment: Payment | null
    action: "verify" | "reject" | null
    adminNotes: string
  }) => void
}

export default function PaymentList({ payments, loadingPayments, setPaymentDialog }: PaymentListProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CreditCard className="h-5 w-5" />
          Payment Verification
        </CardTitle>
        <CardContent>Review and verify user payments</CardContent>
      </CardHeader>
      <CardContent>
        {loadingPayments ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-rose-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading payments...</p>
          </div>
        ) : (
          <div className="space-y-4">
            {payments.map((payment) => (
              <div
                key={payment.id}
                className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50"
              >
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <h3 className="font-medium">{payment.user_name || 'Unknown User'}</h3>
                    <Badge
                      variant={
                        payment.status === "verified"
                          ? "default"
                          : payment.status === "rejected"
                            ? "destructive"
                            : "secondary"
                      }
                    >
                      {payment.status}
                    </Badge>
                  </div>
                  <p className="text-sm text-gray-600">{payment.user_email}</p>
                  <div className="flex items-center gap-4 text-sm text-gray-500">
                    <span className="flex items-center gap-1">
                      ₹{payment.amount} - {payment.plan_name}
                    </span>
                    <span className="flex items-center gap-1">
                      <FileText className="h-3 w-3" />
                      {payment.transaction_id}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {new Date(payment.created_at).toLocaleDateString()}
                    </span>
                  </div>
                  {payment.admin_notes && (
                    <p className="text-sm text-gray-600">Notes: {payment.admin_notes}</p>
                  )}
                  {payment.verified_by_name && payment.verified_at && (
                    <p className="text-sm text-green-600">
                      Verified by {payment.verified_by_name} on{" "}
                      {new Date(payment.verified_at).toLocaleDateString()}
                    </p>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  {payment.screenshot && (
                    <Button variant="outline" size="sm" asChild>
                      <a href={payment.screenshot} target="_blank" rel="noopener noreferrer">
                        <Eye className="h-4 w-4 mr-1" />
                        View Screenshot
                      </a>
                    </Button>
                  )}

                  {payment.status === "pending" && (
                    <>
                      <Button
                        variant="default"
                        size="sm"
                        onClick={() =>
                          setPaymentDialog({
                            open: true,
                            payment,
                            action: "verify",
                            adminNotes: "",
                          })
                        }
                      >
                        <CheckCircle className="h-4 w-4 mr-1" />
                        Verify
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() =>
                          setPaymentDialog({
                            open: true,
                            payment,
                            action: "reject",
                            adminNotes: "",
                          })
                        }
                      >
                        <XCircle className="h-4 w-4 mr-1" />
                        Reject
                      </Button>
                    </>
                  )}
                </div>
              </div>
            ))}

            {payments.length === 0 && (
              <div className="text-center py-8 text-gray-500">No payments found</div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}