import * as React from "react"

const CollapsibleContext = React.createContext<{
  open: boolean;
  onOpenChange: () => void;
}>({
  open: false,
  onOpenChange: () => {},
});

interface CollapsibleProps {
  open?: boolean;
  onOpenChange?: () => void;
  children: React.ReactNode;
}

export const Collapsible = ({ open = false, onOpenChange, children }: CollapsibleProps) => {
  return (
    <CollapsibleContext.Provider value={{ open, onOpenChange: onOpenChange || (() => {}) }}>
      <div>{children}</div>
    </CollapsibleContext.Provider>
  );
};

export const CollapsibleTrigger = ({ children, className }: { children: React.ReactNode; className?: string }) => {
  const { onOpenChange } = React.useContext(CollapsibleContext);
  return (
    <div onClick={onOpenChange} className={className}>
      {children}
    </div>
  );
};

export const CollapsibleContent = ({ children }: { children: React.ReactNode }) => {
  const { open } = React.useContext(CollapsibleContext);
  
  if (!open) return null;
  
  return <div>{children}</div>;
};
