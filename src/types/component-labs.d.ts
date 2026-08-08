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
}
