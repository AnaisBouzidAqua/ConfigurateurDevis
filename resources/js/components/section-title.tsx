export function SectionTitle({ children }: { children: React.ReactNode }) {
    return <h2 className="text-[16px] font-bold leading-[140%] tracking-normal text-[#334155]">{children}</h2>;
}

export function SubSectionTitle({ children }: { children: React.ReactNode }) {
    return <h3 className="text-[14px] font-bold leading-[20px] tracking-normal text-[#334155]">{children}</h3>;
}
