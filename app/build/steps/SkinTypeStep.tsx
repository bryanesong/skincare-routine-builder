import { useState, forwardRef, useImperativeHandle } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"

interface FormData {
  skinType?: string[];
  concerns?: string[];
}

interface SkinTypeStepProps {
  formData: FormData;
  onNext: (data: { skinType: string[]; concerns: string[] }) => void;
}

const skinTypeButtons = [
  {
    id: 'dry',
    label: 'Dry',
    icon: 'https://cdn-icons-png.flaticon.com/512/2784/2784317.png'
  },
  {
    id: 'oily',
    label: 'Oily',
    icon: 'https://cdn-icons-png.flaticon.com/512/3238/3238649.png'
  },
  {
    id: 'combination',
    label: 'Combination',
    icon: 'https://static.thenounproject.com/png/809255-200.png'
  },
  {
    id: 'balanced',
    label: 'Balanced',
    icon: 'https://cdn-icons-png.flaticon.com/512/748/748964.png'
  }
];

const skinConcerns = [
  "Acne",
  "Dryness",
  "Uneven Texture",
  "Aging",
  "Dullness",
  "Hyperpigmentation"
];

const SkinTypeStep = forwardRef((props: SkinTypeStepProps, ref) => {
  const { formData, onNext } = props;
  const [selectedTypes, setSelectedTypes] = useState<string[]>(formData.skinType || []);
  const [selectedConcerns, setSelectedConcerns] = useState(() => {
    if (formData?.concerns) {
      return skinConcerns.map(concern => formData.concerns?.includes(concern) || false);
    }
    return new Array(skinConcerns.length).fill(false);
  });

  const handleConcernToggle = (index: number) => {
    setSelectedConcerns(prev => {
      const newConcerns = [...prev];
      newConcerns[index] = !newConcerns[index];
      return newConcerns;
    });
  };

  const handleSkinTypeSelect = (type: string) => {
    setSelectedTypes(prev => {
      if (type === 'combination') {
        if (prev.includes('combination')) {
          return prev.filter(t => t !== 'combination');
        }
        return ['combination'];
      }
      
      if (prev.includes('combination')) {
        return [type];
      }
      
      const isSelected = prev.includes(type);
      if (isSelected) {
        return prev.filter(t => t !== type);
      } else {
        return [...prev, type];
      }
    });
  };

  const handleNext = () => {
    if (selectedTypes.length === 0) return;
    const selectedConcernsList = skinConcerns.filter((_, index) => selectedConcerns[index]);
    onNext({ 
      skinType: selectedTypes,
      concerns: selectedConcernsList 
    });
  };

  const [isHelpOpen, setIsHelpOpen] = useState(false);

  useImperativeHandle(ref, () => ({
    getData: () => ({
      skinType: selectedTypes,
      skinConcerns: skinConcerns.filter((_, index) => selectedConcerns[index])
    }),
    reset: () => {
      setSelectedTypes([])
      setSelectedConcerns(new Array(skinConcerns.length).fill(false))
    }
  }))

  return (
    <div className="space-y-6 text-center">
      <div>
        <p className="font-bold text-lg">
          What's your skin type?
        </p>
      </div>
      
      <button
        onClick={() => setIsHelpOpen(true)}
        className="text-gray-400 underline italic text-sm hover:text-gray-600 transition-colors"
      >
        Help me find my skin type
      </button>

      {/* TODO add sources (cite them) for the dialog pop up box below and add an image VVV */}
      <Dialog open={isHelpOpen} onOpenChange={setIsHelpOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>How to Determine Your Skin Type</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 text-left">
            <p className="font-semibold">The Bare-Faced Method:</p>
            <ol className="list-decimal list-inside space-y-2">
              <li>Cleanse your face thoroughly and pat dry</li>
              <li>Wait 30 minutes without applying any products</li>
              <li>Observe your skin:</li>
              <ul className="ml-6 mt-2 space-y-1">
                <li>• Dry: Feels tight and may have flaky patches</li>
                <li>• Oily: Looks shiny all over</li>
                <li>• Combination: Oily T-zone, dry cheeks</li>
                <li>• Balanced: Neither too oily nor too dry</li>
              </ul>
            </ol>
          </div>
        </DialogContent>
      </Dialog>

      <div className="flex gap-4 items-center justify-center p-8">
        {skinTypeButtons.map(({ id, label, icon }) => (
          <Button
            key={id}
            onClick={() => handleSkinTypeSelect(id)}
            className={`size-32 text-black flex-col p-8 drop-shadow-lg rounded-3xl transition-all duration-200 ${
              selectedTypes.includes(id)
                ? 'translate-y-0.5 shadow-inner bg-[#B5D7C5] border-[#B5D7C5]'
                : '-translate-y-0.5 shadow-md bg-[#F6FFF8] border-[#F6FFF8]'
            }`}
          >
            <img src={icon} alt={`${label} image icon`} className="size-auto" />
            <span className="mt-2">{label}</span>
          </Button>
        ))}
      </div>

      <div>
        <p className="font-bold text-lg">
          What are your main skin concerns? (Select all that apply)
        </p>
        <div className="grid grid-cols-2 gap-4 max-w-4xl mx-auto">
          {skinConcerns.map((concern, index) => (
            <label
              key={index}
              className="flex items-start gap-3 p-4 rounded-lg transition-colors cursor-pointer"
            >
              <input
                type="checkbox"
                checked={selectedConcerns[index]}
                onChange={() => handleConcernToggle(index)}
                className="mt-1 h-4 w-4 rounded border-gray-300 text-green-500 focus:ring-green-500 checked:bg-green-500 accent-[#B5D7C5]"
              />
              <span className="text-gray-700">{concern}</span>
            </label>
          ))}
        </div>
      </div>
    </div>
  );
})

export default SkinTypeStep