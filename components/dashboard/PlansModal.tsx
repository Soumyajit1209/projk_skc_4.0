import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Card, CardHeader, CardContent, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Crown, PhoneCall, Check } from "lucide-react";
import { Plan } from "../../types/types";

interface PlansModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  plans: Plan[];
  loadingPlans: boolean;
  onSelectPlan: (plan: Plan) => void;
}

export default function PlansModal({ open, onOpenChange, plans, loadingPlans, onSelectPlan }: PlansModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-7xl p-8 sm:p-10 max-h-[90vh] overflow-y-auto">
        <DialogHeader className="text-center mb-8">
          <DialogTitle className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Choose Your Perfect Plan
          </DialogTitle>
          <p className="text-gray-600 mt-2">Unlock premium features to find your ideal match</p>
        </DialogHeader>
        {loadingPlans ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        ) : (
          <div className="space-y-8">
            <Tabs defaultValue="normal" className="w-full">
              {/* Tabs */}
              <TabsList className="grid w-full grid-cols-2 bg-gray-100/80 rounded-lg mb-6">
                <TabsTrigger
                  value="normal"
                  className="py-3 text-sm font-medium data-[state=active]:bg-blue-600 data-[state=active]:text-white"
                >
                  Premium Plans
                </TabsTrigger>
                <TabsTrigger
                  value="call"
                  className="py-3 text-sm font-medium data-[state=active]:bg-blue-600 data-[state=active]:text-white"
                >
                  Call Plans
                </TabsTrigger>
              </TabsList>

              {/* Premium Plans */}
              <TabsContent value="normal" className="mt-0">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {plans
                    .filter((plan) => plan.type === "normal")
                    .map((plan) => (
                      <Card
                        key={plan.id}
                        className="relative bg-white/90 backdrop-blur-sm border border-gray-200 rounded-xl shadow-lg hover:shadow-xl transition-all hover:border-blue-300"
                      >
                        {plan.name.toLowerCase().includes("premium") && (
                          <div className="absolute top-0 right-0 bg-gradient-to-l from-blue-600 to-purple-600 text-white px-4 py-1 text-xs font-semibold rounded-bl-lg">
                            Popular
                          </div>
                        )}
                        <CardHeader className="text-center pb-2">
                          <div className="flex justify-center mb-3">
                            <div className="p-3 bg-gradient-to-r from-blue-100 to-purple-100 rounded-full">
                              <Crown className="h-6 w-6 text-blue-600" />
                            </div>
                          </div>
                          <CardTitle className="text-xl font-semibold text-gray-900">{plan.name}</CardTitle>
                          <div className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                            ₹{plan.price}
                            <span className="text-sm font-normal text-gray-500">/{plan.duration_months}mo</span>
                          </div>
                          <CardDescription className="text-sm text-gray-600 mt-2">{plan.description}</CardDescription>
                        </CardHeader>
                        <CardContent className="px-6 pb-6">
                          <div className="space-y-3 mb-6">
                            {plan.features.map((feature, index) => (
                              <div key={index} className="flex items-center gap-3">
                                <div className="flex-shrink-0 w-5 h-5 bg-green-100 rounded-full flex items-center justify-center">
                                  <Check className="h-3 w-3 text-green-600" />
                                </div>
                                <span className="text-sm text-gray-700">{feature}</span>
                              </div>
                            ))}
                          </div>
                          <Button
                            onClick={() => onSelectPlan(plan)}
                            className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold py-2 rounded-lg"
                          >
                            Choose Plan
                          </Button>
                        </CardContent>
                      </Card>
                    ))}
                </div>
              </TabsContent>

              {/* Call Plans */}
              <TabsContent value="call" className="mt-0">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {plans
                    .filter((plan) => plan.type === "call")
                    .map((plan) => (
                      <Card
                        key={plan.id}
                        className="relative bg-white/90 backdrop-blur-sm border border-gray-200 rounded-xl shadow-lg hover:shadow-xl transition-all hover:border-green-300"
                      >
                        <CardHeader className="text-center pb-2">
                          <div className="flex justify-center mb-3">
                            <div className="p-3 bg-gradient-to-r from-green-100 to-blue-100 rounded-full">
                              <PhoneCall className="h-6 w-6 text-green-600" />
                            </div>
                          </div>
                          <CardTitle className="text-xl font-semibold text-gray-900">{plan.name}</CardTitle>
                          <div className="text-3xl font-bold bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent">
                            ₹{plan.price}
                            <span className="text-sm font-normal text-gray-500">/{plan.call_credits} calls</span>
                          </div>
                          <CardDescription className="text-sm text-gray-600 mt-2">{plan.description}</CardDescription>
                        </CardHeader>
                        <CardContent className="px-6 pb-6">
                          <div className="space-y-3 mb-6">
                            {plan.features.map((feature, index) => (
                              <div key={index} className="flex items-center gap-3">
                                <div className="flex-shrink-0 w-5 h-5 bg-green-100 rounded-full flex items-center justify-center">
                                  <Check className="h-3 w-3 text-green-600" />
                                </div>
                                <span className="text-sm text-gray-700">{feature}</span>
                              </div>
                            ))}
                          </div>
                          <Button
                            onClick={() => onSelectPlan(plan)}
                            className="w-full bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 text-white font-semibold py-2 rounded-lg"
                          >
                            Buy Credits
                          </Button>
                        </CardContent>
                      </Card>
                    ))}
                </div>
              </TabsContent>
            </Tabs>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
