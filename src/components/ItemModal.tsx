import React, { useState, useEffect } from 'react';
import {
  IonModal,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonButtons,
  IonButton,
  IonContent,
  IonItem,
  IonLabel,
  IonInput,
  IonSelect,
  IonSelectOption,
  IonTextarea,
  IonGrid,
  IonRow,
  IonCol,
  IonIcon,
  IonNote
} from '@ionic/react';
import { closeOutline, saveOutline, calculatorOutline, imageOutline } from 'ionicons/icons';
import { InventoryItem, ItemCategory, ItemCondition, ListingStatus } from '../types/inventory';
import { useInventory } from '../context/InventoryContext';

interface ItemModalProps {
  isOpen: boolean;
  onClose: () => void;
  itemToEdit?: InventoryItem | null;
}

const categories: ItemCategory[] = [
  'Electronics',
  'Video Games & Consoles',
  'Collectibles',
  'Clothing & Sneakers',
  'Toys & Hobbies',
  'Home & Garden',
  'Jewelry & Watches',
  'Other'
];

const conditions: ItemCondition[] = [
  'Brand New',
  'Like New',
  'Very Good',
  'Good',
  'Acceptable',
  'For Parts / Repair'
];

const statuses: ListingStatus[] = ['Active', 'Draft', 'Sold', 'Shipped', 'Archived'];

export const ItemModal: React.FC<ItemModalProps> = ({ isOpen, onClose, itemToEdit }) => {
  const { addItem, updateItem, bins } = useInventory();

  const [title, setTitle] = useState('');
  const [sku, setSku] = useState('');
  const [category, setCategory] = useState<ItemCategory>('Electronics');
  const [condition, setCondition] = useState<ItemCondition>('Very Good');
  const [purchaseCost, setPurchaseCost] = useState<number>(0);
  const [listPrice, setListPrice] = useState<number>(0);
  const [quantity, setQuantity] = useState<number>(1);
  const [locationBin, setLocationBin] = useState<string>('Bin A1');
  const [status, setStatus] = useState<ListingStatus>('Active');
  const [imageUrl, setImageUrl] = useState<string>('');
  const [notes, setNotes] = useState<string>('');
  const [ebayListingId, setEbayListingId] = useState<string>('');
  const [weightOz, setWeightOz] = useState<number>(16);

  useEffect(() => {
    if (itemToEdit) {
      setTitle(itemToEdit.title);
      setSku(itemToEdit.sku);
      setCategory(itemToEdit.category);
      setCondition(itemToEdit.condition);
      setPurchaseCost(itemToEdit.purchaseCost);
      setListPrice(itemToEdit.listPrice);
      setQuantity(itemToEdit.quantity);
      setLocationBin(itemToEdit.locationBin);
      setStatus(itemToEdit.status);
      setImageUrl(itemToEdit.imageUrl || '');
      setNotes(itemToEdit.notes || '');
      setEbayListingId(itemToEdit.ebayListingId || '');
      setWeightOz(itemToEdit.weightOz || 16);
    } else {
      // Defaults for new item
      setTitle('');
      setSku(`SKU-${Math.floor(100000 + Math.random() * 900000)}`);
      setCategory('Electronics');
      setCondition('Very Good');
      setPurchaseCost(20.00);
      setListPrice(59.99);
      setQuantity(1);
      setLocationBin(bins.length > 0 ? bins[0].name : 'Bin A1');
      setStatus('Active');
      setImageUrl('https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?auto=format&fit=crop&w=600&q=80');
      setNotes('');
      setEbayListingId('');
      setWeightOz(16);
    }
  }, [itemToEdit, isOpen, bins]);

  // Live calculations
  const estimatedFee = (listPrice * 0.1325) + 0.30;
  const estimatedNet = listPrice - purchaseCost - estimatedFee;
  const marginPct = listPrice > 0 ? ((estimatedNet / listPrice) * 100).toFixed(1) : '0';

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    const payload = {
      title: title.trim(),
      sku: sku.trim() || `SKU-${Date.now()}`,
      category,
      condition,
      purchaseCost: Number(purchaseCost) || 0,
      listPrice: Number(listPrice) || 0,
      quantity: Number(quantity) || 1,
      locationBin,
      status,
      imageUrl: imageUrl.trim() || 'https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?auto=format&fit=crop&w=600&q=80',
      notes: notes.trim(),
      ebayListingId: ebayListingId.trim(),
      ebayUrl: ebayListingId ? `https://www.ebay.com/itm/${ebayListingId}` : undefined,
      dateAcquired: itemToEdit?.dateAcquired || new Date().toISOString().split('T')[0],
      dateListed: status === 'Active' ? (itemToEdit?.dateListed || new Date().toISOString().split('T')[0]) : undefined,
      weightOz: Number(weightOz) || 16
    };

    if (itemToEdit) {
      updateItem({ ...payload, id: itemToEdit.id });
    } else {
      addItem(payload);
    }

    onClose();
  };

  return (
    <IonModal isOpen={isOpen} onDidDismiss={onClose} className="item-modal">
      <IonHeader>
        <IonToolbar color="dark">
          <IonTitle>{itemToEdit ? 'Edit Item' : 'Add New Inventory Item'}</IonTitle>
          <IonButtons slot="end">
            <IonButton onClick={onClose}>
              <IonIcon icon={closeOutline} />
            </IonButton>
          </IonButtons>
        </IonToolbar>
      </IonHeader>

      <IonContent className="ion-padding">
        <form onSubmit={handleSubmit}>
          <IonGrid>
            {/* Real-time Profit Preview Box */}
            <IonRow className="ion-margin-bottom">
              <IonCol size="12">
                <div style={{
                  background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.15), rgba(16, 185, 129, 0.15))',
                  border: '1px solid rgba(59, 130, 246, 0.3)',
                  borderRadius: '12px',
                  padding: '16px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  flexWrap: 'wrap',
                  gap: '12px'
                }}>
                  <div>
                    <div style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--app-subtext)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <IonIcon icon={calculatorOutline} /> Estimated Net Profit (after ~13.25% eBay fee)
                    </div>
                    <div style={{ fontSize: '1.6rem', fontWeight: 800, color: estimatedNet >= 0 ? '#10b981' : '#ef4444' }}>
                      ${estimatedNet.toFixed(2)}
                    </div>
                  </div>

                  <div style={{ textAlign: 'right' }}>
                    <span className="profit-pill">
                      {marginPct}% Est. Margin
                    </span>
                    <div style={{ fontSize: '0.75rem', color: 'var(--app-subtext)', marginTop: '4px' }}>
                      Fee: ~${estimatedFee.toFixed(2)}
                    </div>
                  </div>
                </div>
              </IonCol>
            </IonRow>

            {/* Title */}
            <IonRow>
              <IonCol size="12">
                <IonItem style={{ borderRadius: '8px' }}>
                  <IonLabel position="stacked">Item Title *</IonLabel>
                  <IonInput
                    value={title}
                    onIonInput={e => setTitle(e.detail.value || '')}
                    placeholder="e.g. Nintendo Game Boy Color Atomic Purple - Tested"
                    required
                  />
                </IonItem>
              </IonCol>
            </IonRow>

            {/* Price & Cost */}
            <IonRow>
              <IonCol size="6">
                <IonItem>
                  <IonLabel position="stacked">Purchase Cost ($)</IonLabel>
                  <IonInput
                    type="number"
                    step="0.01"
                    value={purchaseCost}
                    onIonInput={e => setPurchaseCost(parseFloat(e.detail.value || '0'))}
                  />
                </IonItem>
              </IonCol>

              <IonCol size="6">
                <IonItem>
                  <IonLabel position="stacked">Target List Price ($)</IonLabel>
                  <IonInput
                    type="number"
                    step="0.01"
                    value={listPrice}
                    onIonInput={e => setListPrice(parseFloat(e.detail.value || '0'))}
                  />
                </IonItem>
              </IonCol>
            </IonRow>

            {/* SKU & Storage Bin */}
            <IonRow>
              <IonCol size="6">
                <IonItem>
                  <IonLabel position="stacked">Custom SKU</IonLabel>
                  <IonInput
                    value={sku}
                    onIonInput={e => setSku(e.detail.value || '')}
                    placeholder="e.g. GME-GBC-001"
                  />
                </IonItem>
              </IonCol>

              <IonCol size="6">
                <IonItem>
                  <IonLabel position="stacked">Storage Location Bin</IonLabel>
                  <IonSelect
                    value={locationBin}
                    onIonChange={e => setLocationBin(e.detail.value)}
                  >
                    {bins.map(bin => (
                      <IonSelectOption key={bin.id} value={bin.name}>
                        {bin.name} ({bin.location})
                      </IonSelectOption>
                    ))}
                  </IonSelect>
                </IonItem>
              </IonCol>
            </IonRow>

            {/* Category & Condition */}
            <IonRow>
              <IonCol size="6">
                <IonItem>
                  <IonLabel position="stacked">Category</IonLabel>
                  <IonSelect
                    value={category}
                    onIonChange={e => setCategory(e.detail.value as ItemCategory)}
                  >
                    {categories.map(cat => (
                      <IonSelectOption key={cat} value={cat}>{cat}</IonSelectOption>
                    ))}
                  </IonSelect>
                </IonItem>
              </IonCol>

              <IonCol size="6">
                <IonItem>
                  <IonLabel position="stacked">Condition</IonLabel>
                  <IonSelect
                    value={condition}
                    onIonChange={e => setCondition(e.detail.value as ItemCondition)}
                  >
                    {conditions.map(cond => (
                      <IonSelectOption key={cond} value={cond}>{cond}</IonSelectOption>
                    ))}
                  </IonSelect>
                </IonItem>
              </IonCol>
            </IonRow>

            {/* Status & Quantity */}
            <IonRow>
              <IonCol size="6">
                <IonItem>
                  <IonLabel position="stacked">Listing Status</IonLabel>
                  <IonSelect
                    value={status}
                    onIonChange={e => setStatus(e.detail.value as ListingStatus)}
                  >
                    {statuses.map(st => (
                      <IonSelectOption key={st} value={st}>{st}</IonSelectOption>
                    ))}
                  </IonSelect>
                </IonItem>
              </IonCol>

              <IonCol size="6">
                <IonItem>
                  <IonLabel position="stacked">Quantity</IonLabel>
                  <IonInput
                    type="number"
                    min="1"
                    value={quantity}
                    onIonInput={e => setQuantity(parseInt(e.detail.value || '1', 10))}
                  />
                </IonItem>
              </IonCol>
            </IonRow>

            {/* Image URL & eBay Listing ID */}
            <IonRow>
              <IonCol size="6">
                <IonItem>
                  <IonLabel position="stacked">Image URL</IonLabel>
                  <IonInput
                    value={imageUrl}
                    onIonInput={e => setImageUrl(e.detail.value || '')}
                    placeholder="https://images.unsplash..."
                  />
                </IonItem>
              </IonCol>

              <IonCol size="6">
                <IonItem>
                  <IonLabel position="stacked">eBay Item ID (Optional)</IonLabel>
                  <IonInput
                    value={ebayListingId}
                    onIonInput={e => setEbayListingId(e.detail.value || '')}
                    placeholder="e.g. 284918274019"
                  />
                </IonItem>
              </IonCol>
            </IonRow>

            {/* Notes */}
            <IonRow>
              <IonCol size="12">
                <IonItem>
                  <IonLabel position="stacked">Condition Notes / Serial Numbers</IonLabel>
                  <IonTextarea
                    rows={3}
                    value={notes}
                    onIonInput={e => setNotes(e.detail.value || '')}
                    placeholder="Tested, includes power cord, minor wear on corners..."
                  />
                </IonItem>
              </IonCol>
            </IonRow>

            {/* Form Action Buttons */}
            <IonRow className="ion-margin-top">
              <IonCol size="6">
                <IonButton expand="block" fill="outline" color="medium" onClick={onClose}>
                  Cancel
                </IonButton>
              </IonCol>
              <IonCol size="6">
                <IonButton expand="block" color="primary" type="submit">
                  <IonIcon slot="start" icon={saveOutline} />
                  {itemToEdit ? 'Update Item' : 'Save Item'}
                </IonButton>
              </IonCol>
            </IonRow>
          </IonGrid>
        </form>
      </IonContent>
    </IonModal>
  );
};
