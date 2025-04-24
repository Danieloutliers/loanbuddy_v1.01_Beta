import React from 'react';
import { useLocation } from 'wouter';
import Layout from '@/components/layout/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { useLoanContext } from '@/context/LoanContext';
import { useToast } from '@/hooks/use-toast';

const formSchema = z.object({
  name: z.string().min(2, "Nome deve ter pelo menos 2 caracteres"),
  email: z.string().email("Email inválido").optional().or(z.literal('')),
  phone: z.string().optional().or(z.literal('')),
});

type FormValues = z.infer<typeof formSchema>;

export default function NewBorrowerPage() {
  const [_, navigate] = useLocation();
  const { addBorrower } = useLoanContext();
  const { toast } = useToast();
  
  // Initialize form with default values
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
    },
  });
  
  const onSubmit = async (data: FormValues) => {
    try {
      // Add borrower
      const newBorrower = addBorrower({
        name: data.name,
        email: data.email || undefined,
        phone: data.phone || undefined,
      });
      
      toast({
        title: "Mutuário criado",
        description: `${data.name} foi adicionado com sucesso.`,
      });
      
      // Redirect to borrower details
      navigate(`/borrowers/${newBorrower.id}`);
    } catch (error) {
      console.error(error);
      toast({
        title: "Erro",
        description: "Ocorreu um erro ao criar o mutuário.",
        variant: "destructive",
      });
    }
  };
  
  return (
    <Layout>
      <main className="flex-1 p-4 md:p-6">
        <div className="mb-6">
          <h1 className="text-2xl font-semibold text-slate-900">Novo Mutuário</h1>
          <p className="mt-1 text-sm text-slate-500">Adicione um novo mutuário ao sistema</p>
        </div>
        
        <Card className="max-w-2xl mx-auto">
          <CardHeader>
            <CardTitle>Formulário de Mutuário</CardTitle>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nome Completo</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input type="email" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="phone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Telefone</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <div className="flex justify-end gap-3">
                  <Button variant="outline" type="button" onClick={() => navigate('/borrowers')}>
                    Cancelar
                  </Button>
                  <Button type="submit">
                    Criar Mutuário
                  </Button>
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>
      </main>
    </Layout>
  );
}
