# LoanBuddy

## Visão Geral

LoanBuddy é uma aplicação de gerenciamento de empréstimos desenvolvida com React e TypeScript. Esta aplicação permite aos usuários acompanhar e gerenciar empréstimos, pagamentos e informações de clientes de forma eficiente.

## Funcionalidades

-   Gerenciamento de empréstimos: Adicione, edite e visualize informações detalhadas sobre empréstimos.
-   Gerenciamento de pagamentos: Registre e acompanhe pagamentos de empréstimos.
-   Dashboard: Visualize métricas importantes sobre empréstimos e pagamentos.
-   Relatórios: Gere relatórios sobre o estado dos empréstimos e pagamentos.

## Modificações Recentes

### Implementação de Juros Simples

A aplicação foi modificada para utilizar o cálculo de juros simples em vez de juros compostos. As seguintes alterações foram realizadas:

-   **Função `calculatePaymentDistribution`:**
    -   A função `calculatePaymentDistribution` foi atualizada para calcular a distribuição entre juros e principal com base na lógica de juros simples.
    -   O cálculo do total de juros devidos é feito utilizando a fórmula: `Juros = Principal * Taxa de Juros`.
    -   A distribuição do pagamento é feita de forma que os juros não excedam o total de juros devidos e o principal não seja negativo.

    ```typescript
    export function calculatePaymentDistribution(
      loan: Loan | undefined,
      paymentAmount: number,
      payments: Payment[] = []
    ): { principal: number; interest: number } {
      if (!loan) {
        return { principal: 0, interest: 0 };
      }

      // Calculate total interest due based on simple interest
      const principal = loan.principal;
      const rate = loan.interestRate / 100;
      const totalInterest = principal * rate;

      // Determine interest and principal portions
      let interestComponent = Math.min(paymentAmount, totalInterest); // Interest cannot exceed total interest
      let principalComponent = paymentAmount - interestComponent;

      return {
        interest: interestComponent,
        principal: principalComponent > 0 ? principalComponent : 0, // Principal cannot be negative
      };
    }
    ```

## Próximos Passos

-   Testar as modificações implementadas para garantir que os cálculos de juros simples estejam corretos.
-   Implementar funcionalidades adicionais conforme necessário.

## Como Contribuir

Contribuições são bem-vindas! Sinta-se à vontade para abrir issues e enviar pull requests.

## Licença

Este projeto está licenciado sob a [MIT License](LICENSE).
