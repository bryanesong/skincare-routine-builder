import { forwardRef, useImperativeHandle, useState } from "react"
import { Button } from "@/components/ui/button"
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"

interface FormData {
    skinType: string[] | string;
    skinConcerns: string[];
    climate: string[];
    preferences: {
        morningProducts: string[];
        nightProducts: string[];
    };
}

interface ClimateStepProps {
    formData: FormData;
    onNext: (data: { climate: string[] }) => void;
}

const climateButtons = [
    {
        id: 'polluted',
        label: 'Polluted',
        icon: 'https://png.pngtree.com/png-clipart/20230418/original/pngtree-pollution-line-icon-png-image_9065268.png'
    },
    {
        id: 'humid',
        label: 'Humid',
        icon: 'https://cdn-icons-png.flaticon.com/512/219/219816.png'
    },
    {
        id: 'dry',
        label: 'Dry',
        icon: 'https://cdn-icons-png.flaticon.com/512/2784/2784317.png'
    },
    {
        id: 'hot',
        label: 'Hot',
        icon: 'https://icons.veryicon.com/png/o/commerce-shopping/shopping-happy/hot-9.png'
    },
    {
        id: 'windy',
        label: 'Windy',
        icon: 'https://cdn-icons-png.flaticon.com/512/4150/4150819.png'
    },
    {
        id: 'not-sure',
        label: 'Not Sure',
        icon: 'https://static.thenounproject.com/png/4126515-200.png'
    },
];

const ClimateStep = forwardRef(({ formData, onNext }: ClimateStepProps, ref) => {
    const [selectedClimates, setSelectedClimates] = useState<string[]>(formData.climate || []);

    useImperativeHandle(ref, () => ({
        getData: () => ({
            climate: selectedClimates
        }),
        reset: () => {
            console.log('resetting climate')
            setSelectedClimates(new Array(climateButtons.length).fill(false))
        }
    }));

    const handleClimateToggle = (climate: string) => {
        setSelectedClimates(prev =>
            prev.includes(climate)
                ? prev.filter(c => c !== climate)
                : [...prev, climate]
        );
    };

    return (
        <div className="space-y-6 justify-center items-center text-center">
            <p className="font-bold text-lg">
                What type of climate do you live in? (select all that apply):
            </p>
            <Dialog>
                <DialogTrigger asChild>
                    <button className="text-gray-400 underline italic text-sm hover:text-gray-600 transition-colors">
                        Why does this matter?
                    </button>
                </DialogTrigger>
                <DialogContent className="max-w-md">
                    <DialogHeader>
                        <DialogTitle className="text-xl mb-4">Understanding Your Climate</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                        <p className="text-sm text-gray-600">
                            Your climate plays a crucial role in determining your skin's needs and the appropriate skincare routine.
                        </p>
                        <ul className="text-sm text-gray-600 list-disc pl-4 space-y-2">
                            <li><span className="font-medium">Acne:</span> Can be caused by hormonal changes, bacteria, and dead skin cells</li>
                            <li><span className="font-medium">Aging:</span> Is a natural process that affects skin texture, elasticity, and hydration</li>
                            <li><span className="font-medium">Dark spots:</span> Can be caused by sun exposure, hormonal changes, or inflammation</li>
                            <li><span className="font-medium">Dryness:</span> Can be caused by dehydration, environmental factors, or genetics</li>
                            <li><span className="font-medium">Redness:</span> Can be caused by inflammation, sensitivity, or exposure to irritants</li>
                            <li><span className="font-medium">Large pores:</span> Can be caused by excess oil production, aging, or genetics</li>
                        </ul>
                    </div>
                </DialogContent>
            </Dialog>

            <div className="flex justify-center w-full">
                <div className="grid grid-cols-3 gap-8 max-w-[600px] p-4">
                    {climateButtons.map((item) => (
                        <button
                            key={item.id}
                            onClick={() => handleClimateToggle(item.label)}
                            className={`size-32 text-black flex flex-col items-center justify-center p-4 drop-shadow-lg rounded-3xl transition-all duration-200 hover:bg-none ${
                                selectedClimates.includes(item.label)
                                    ? 'translate-y-0.5 shadow-inner bg-[#B5D7C5] border-[#B5D7C5]'
                                    : '-translate-y-0.5 shadow-md bg-[#F6FFF8] border-[#F6FFF8]'
                                }`}
                        >
                            <div className="flex items-center justify-center w-12 h-12">
                                <img src={item.icon} alt={`${item.label} image icon`} className="w-10 h-10 object-contain" />
                            </div>
                            <span className="mt-2 text-sm break-words text-center">{item.label}</span>
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );
});

ClimateStep.displayName = "ClimateStep";

export default ClimateStep;