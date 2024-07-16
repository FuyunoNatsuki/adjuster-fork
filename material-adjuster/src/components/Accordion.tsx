import { useCallback, useState } from 'react';

export const Accordion = ({
    parentClassName,
    titleClassName,
    childClassName,
    title,
    children
}: {
    parentClassName?: string,
    titleClassName?: string,
    childClassName?: string,
    title: string,
    children: string | JSX.Element
}) => {
    const [isOpen, setIsOpen] = useState(false);

    const toggleAccordion = () => {
        setIsOpen(!isOpen);
    };
    const closeAccordionOnBackgroundClick = useCallback((e: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
        if (e.target === e.currentTarget) {
            setIsOpen(false);
        }
    }, [
        parentClassName,
        titleClassName,
        childClassName,
        title,
        children
    ]);

    return (
        <div className={parentClassName ? parentClassName : ''}>
            <div className={typeof titleClassName !== 'undefined' ? titleClassName : ''} onClick={toggleAccordion}>
                {title + (isOpen ? '▼' : '▲')}
            </div>
            {isOpen && (
                <div
                    className={typeof childClassName !== 'undefined' ? childClassName : ''}
                    onClick={closeAccordionOnBackgroundClick}
                >{children}</div>
            )}
        </div>
    );
};