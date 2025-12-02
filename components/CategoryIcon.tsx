"use client";

import { 
    HiSparkles, HiCloud, HiWrenchScrewdriver, HiCreditCard, HiBolt,
    HiMegaphone, HiShoppingCart, HiPaintBrush, HiPuzzlePiece, HiChartBar,
    HiAcademicCap, HiHeart, HiDevicePhoneMobile, HiPencilSquare, HiBanknotes,
    HiChatBubbleLeftRight, HiUserGroup, HiHomeModern, HiPaperAirplane, HiLockClosed,
    HiCube
} from "react-icons/hi2";

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
    "HiSparkles": HiSparkles,
    "HiCloud": HiCloud,
    "HiWrenchScrewdriver": HiWrenchScrewdriver,
    "HiCreditCard": HiCreditCard,
    "HiBolt": HiBolt,
    "HiMegaphone": HiMegaphone,
    "HiShoppingCart": HiShoppingCart,
    "HiPaintBrush": HiPaintBrush,
    "HiPuzzlePiece": HiPuzzlePiece,
    "HiChartBar": HiChartBar,
    "HiAcademicCap": HiAcademicCap,
    "HiHeart": HiHeart,
    "HiDevicePhoneMobile": HiDevicePhoneMobile,
    "HiPencilSquare": HiPencilSquare,
    "HiBanknotes": HiBanknotes,
    "HiChatBubbleLeftRight": HiChatBubbleLeftRight,
    "HiUserGroup": HiUserGroup,
    "HiHomeModern": HiHomeModern,
    "HiPaperAirplane": HiPaperAirplane,
    "HiLockClosed": HiLockClosed,
};

interface CategoryIconProps {
    iconName: string;
    className?: string;
}

export function CategoryIcon({ iconName, className = "w-4 h-4" }: CategoryIconProps) {
    const IconComponent = iconMap[iconName] || HiCube;
    return <IconComponent className={className} />;
}
