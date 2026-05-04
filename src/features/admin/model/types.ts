export type ChangeType = 'new' | 'price' | 'status' | 'emissions' | 'unchanged';

export interface DiffItem {
  product: any; // Using any for now to match existing implementation in usePDFDiff
  type: ChangeType;
  diffData: any;
}
