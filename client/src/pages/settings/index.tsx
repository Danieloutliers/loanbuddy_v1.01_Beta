import React from 'react';
import Layout from '@/components/layout/Layout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Form, 
  FormControl, 
  FormField, 
  FormItem, 
  FormLabel, 
  FormMessage 
} from '@/components/ui/form';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { useLoanContext } from '@/context/LoanContext';
import { PaymentFrequency } from '@/types';
import { useToast } from '@/hooks/use-toast';
import { Save } from 'lucide-react';

const formSchema = z.object({
  defaultInterestRate: z.coerce.number().min(0, "Taxa de juros não pode ser negativa"),
  defaultPaymentFrequency: z.enum(['weekly', 'biweekly', 'monthly', 'quarterly', 'yearly', 'custom']),
  defaultInstallments: z.coerce.number().int().positive("Número de parcelas deve ser positivo"),
  currency: z.string().min(1, "Moeda é obrigatória"),
});

type FormValues = z.infer<typeof formSchema>;

export default function SettingsPage() {
  const { settings, updateSettings } = useLoanContext();
  const { toast } = useToast();
  
  // Initialize form with current settings
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      defaultInterestRate: settings.defaultInterestRate,
      defaultPaymentFrequency: settings.defaultPaymentFrequency,
      defaultInstallments: settings.defaultInstallments,
      currency: settings.currency,
    },
  });
  
  const onSubmit = async (data: FormValues) => {
    try {
      updateSettings(data);
      
      toast({
        title: "Configurações salvas",
        description: "As configurações foram atualizadas com sucesso.",
      });
    } catch (error) {
      console.error(error);
      toast({
        title: "Erro",
        description: "Ocorreu um erro ao salvar as configurações.",
        variant: "destructive",
      });
    }
  };
  
  return (
    <Layout>
      <main className="flex-1 p-4 md:p-6">
        <div className="mb-6">
          <h1 className="text-2xl font-semibold text-slate-900">Configurações</h1>
          <p className="mt-1 text-sm text-slate-500">Personalize o funcionamento do sistema</p>
        </div>
        
        <Card className="max-w-2xl">
          <CardHeader>
            <CardTitle>Configurações Padrão</CardTitle>
            <CardDescription>
              Defina os valores padrão para novos empréstimos
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <FormField
                  control={form.control}
                  name="defaultInterestRate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Taxa de Juros Padrão (%)</FormLabel>
                      <FormControl>
                        <Input type="number" step="0.01" min="0" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="defaultPaymentFrequency"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Frequência de Pagamento Padrão</FormLabel>
                      <Select 
                        onValueChange={field.onChange} 
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione a frequência" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="weekly">Semanal</SelectItem>
                          <SelectItem value="biweekly">Quinzenal</SelectItem>
                          <SelectItem value="monthly">Mensal</SelectItem>
                          <SelectItem value="quarterly">Trimestral</SelectItem>
                          <SelectItem value="yearly">Anual</SelectItem>
                          <SelectItem value="custom">Personalizado</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="defaultInstallments"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Número de Parcelas Padrão</FormLabel>
                      <FormControl>
                        <Input type="number" min="1" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="currency"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Moeda</FormLabel>
                      <Select 
                        onValueChange={field.onChange} 
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione a moeda" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="BRL">Real (R$)</SelectItem>
                          <SelectItem value="USD">Dólar ($)</SelectItem>
                          <SelectItem value="EUR">Euro (€)</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <Button type="submit">
                  <Save className="mr-2 h-4 w-4" />
                  Salvar Configurações
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>
        
        <Card className="max-w-2xl mt-6">
          <CardHeader>
            <CardTitle>Sobre o Sistema</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <p className="text-sm text-slate-700">
                <strong>LoanBuddy</strong> - Sistema de Gerenciamento de Empréstimos
              </p>
              <p className="text-sm text-slate-500">
                Versão 1.0.0
              </p>
              <p className="text-sm text-slate-500">
                Desenvolvido com React, TypeScript e Tailwind CSS
              </p>
            </div>
          </CardContent>
        </Card>
      </main>
    </Layout>
  );
}
