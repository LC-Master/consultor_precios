import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const inputVariants = cva(
    "w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50",
    {
        variants: {
            variant: {
                primary: "bg-white text-black",
                secondary: "bg-gray-100 text-gray-700",
            },
            inputSize: { 
                small: "text-sm",
                medium: "text-base",
                large: "text-lg",
            },
        },
        defaultVariants: {
            variant: "primary",
            inputSize: "medium",
        },
    }
);

export interface InputProps
    extends React.InputHTMLAttributes<HTMLInputElement>,
    VariantProps<typeof inputVariants> { }

const Input = React.forwardRef<HTMLInputElement, InputProps>(
    ({ className, variant, inputSize, type, ...props }, ref) => {
        return (
            <input
                type={type}
                className={cn(inputVariants({ variant, inputSize }), className)}
                ref={ref}
                {...props} 
            />
        );
    }
);

Input.displayName = "Input";

export { Input };