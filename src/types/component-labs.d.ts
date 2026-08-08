declare module 'component-labs' {
  interface FlowStep {
    readonly label: string;
    readonly desc: string;
    readonly dot: string;
    readonly color: string;
  }

  interface AgenticFlowCardProps {
    readonly steps?: readonly FlowStep[];
    readonly title?: string;
    readonly className?: string;
  }

  export const AgenticFlowCard: React.FC<AgenticFlowCardProps>;

  interface SaaSFooterProps {
    readonly ctaTitle?: string;
    readonly ctaDescription?: string;
    readonly ctaButtonText?: string;
    readonly brandName?: string;
    readonly brandDescription?: string;
    readonly productLinks?: readonly string[];
    readonly companyLinks?: readonly string[];
    readonly copyright?: string;
    readonly statusText?: string;
    readonly className?: string;
  }

  export const SaaSFooter: React.FC<SaaSFooterProps>;
}
