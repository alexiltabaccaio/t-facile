import { 
  Search, 
  Filter, 
  History, 
  Bell, 
  ChevronRight, 
  Triangle,
  ArrowDown,
  ArrowUp,
  ChevronsUpDown,
  Check,
  Megaphone,
  Trash2,
  Settings,
  Lock,
  Moon,
  Sun,
  Laptop,
  RefreshCcw,
  Copy
} from 'lucide-react';

export const SearchIcon = Search;
export const FilterIcon = Filter;
export const HistoryIcon = History;
export const BellIcon = Bell;
export const ChevronRightIcon = ChevronRight;
export const ArrowDownIcon = ArrowDown;
export const ArrowUpIcon = ArrowUp;
export const ArrowsUpDownIcon = ChevronsUpDown;
export const CheckIcon = Check;
export const MegaphoneIcon = Megaphone;
export const TrashIcon = Trash2;
export const SettingsIcon = Settings;
export const LockIcon = Lock;
export const MoonIcon = Moon;
export const SunIcon = Sun;
export const LaptopIcon = Laptop;
export const RefreshIcon = RefreshCcw;
export const CopyIcon = Copy;

export const TriangleUpIcon = (props: any) => <Triangle {...props} fill="currentColor" />;
export const TriangleDownIcon = (props: any) => <Triangle {...props} fill="currentColor" className={`${props.className || ''} rotate-180`} />;
