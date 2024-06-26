import { CodegenConfig } from '@graphql-codegen/cli';

const config: CodegenConfig = {
  schema: './src/graphql/types',
  emitLegacyCommonJSImports: false,
  generates: {
    './src/graphql/__generated__/types.ts': {
      plugins: ['typescript', 'typescript-resolvers'],
      config: {
        useIndexSignature: true,
        contextType: '../../context#ContextValue',
      },
    },
  },

  config: {
    mappers: {
      User: '../../../node_modules/.prisma/client#User as UserModel',
      Loan: '../../../node_modules/.prisma/client#Loan as LoanModel',
      LoanCalculation: '../../../node_modules/.prisma/client#LoanCalculation as LoanCalculationModel',
      Comment: '../../../node_modules/.prisma/client#Comment as CommentModel',
      Finance: '../../../node_modules/.prisma/client#FinancialHistory as FinancialHistoryModel',
    },
    inputMaybeValue: 'undefined | T',
  },

  watch: true,
};

export default config;
