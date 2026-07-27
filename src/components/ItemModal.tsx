import React, { useState, useEffect, useRef } from 'react';
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
import { closeOutline, saveOutline, calculatorOutline, imageOutline, cameraOutline, addOutline, trashOutline } from 'ionicons/icons';
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

  const fileInputRef = useRef<HTMLInputElement>(null);

  const [title, setTitle] = useState('');
  const [sku, setSku] = useState('');
  const [category, setCategory] = useState<ItemCategory>('Electronics');
  const [condition, setCondition] = useState<ItemCondition>('Very Good');
  const [purchaseCost, setPurchaseCost] = useState<number>(0);
  const [listPrice, setListPrice] = useState<number>(0);
  const [quantity, setQuantity] = useState<number>(1);
  const [locationBin, setLocationBin] = useState<string>('Bin A1');
  const [status, setStatus] = useState<ListingStatus>('Active');
  const [images, setImages] = useState<string[]>([]);
  const [showUrlInput, setShowUrlInput] = useState<boolean>(false);
  const [customUrl, setCustomUrl] = useState<string>('');
  const [notes, setNotes] = useState<string>('');
  const [ebayListingId, setEbayListingId] = useState<string>('');
  const [weightOz, setWeightOz] = useState<number>(16);

  const MAX_IMAGES = 5;

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
      const existingImages = itemToEdit.images && itemToEdit.images.length > 0
        ? itemToEdit.images
        : (itemToEdit.imageUrl ? [itemToEdit.imageUrl] : []);
      setImages(existingImages);
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
      const defaultImg = 'https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?auto=format&fit=crop&w=600&q=80';
      setImages([defaultImg]);
      setNotes('');
      setEbayListingId('');
      setWeightOz(16);
    }
    setShowUrlInput(false);
    setCustomUrl('');
  }, [itemToEdit, isOpen, bins]);

  // Live calculations
  const estimatedFee = (listPrice * 0.1325) + 0.30;
  const estimatedNet = listPrice - purchaseCost - estimatedFee;
  const marginPct = listPrice > 0 ? ((estimatedNet / listPrice) * 100).toFixed(1) : '0';

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const remainingSlots = MAX_IMAGES - images.length;
    if (remainingSlots <= 0) return;

    const selectedFiles = Array.from(files).slice(0, remainingSlots);
    const filePromises = selectedFiles.map(file => {
      return new Promise<string>((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => {
          if (typeof reader.result === 'string') {
            resolve(reader.result);
          }
        };
        reader.readAsDataURL(file);
      });
    });

    Promise.all(filePromises).then(newImages => {
      setImages(prev => [...prev, ...newImages].slice(0, MAX_IMAGES));
    });

    if (e.target) e.target.value = '';
  };

  const handleRemoveImage = (index: number, e: React.MouseEvent) => {
    e.stopPropagation();
    setImages(prev => prev.filter((_, i) => i !== index));
  };

  const handleSelectPrimaryImage = (index: number) => {
    if (index === 0) return;
    setImages(prev => {
      const next = [...prev];
      const [selected] = next.splice(index, 1);
      return [selected, ...next];
    });
  };

  const handleAddUrlImage = () => {
    if (!customUrl.trim()) return;
    if (images.length >= MAX_IMAGES) return;
    setImages(prev => [...prev, customUrl.trim()].slice(0, MAX_IMAGES));
    setCustomUrl('');
    setShowUrlInput(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    const primaryImg = images.length > 0
      ? images[0]
      : 'https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?auto=format&fit=crop&w=600&q=80';

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
      imageUrl: primaryImg,
      images: images.length > 0 ? images : [primaryImg],
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

            {/* Camera Capture & Image Gallery Section */}
            <IonRow>
              <IonCol size="12">
                <div className="photo-picker-container">
                  <div className="photo-picker-header">
                    <div className="photo-picker-title">
                      <IonIcon icon={cameraOutline} style={{ fontSize: '1.2rem', color: '#3b82f6' }} />
                      <span>Item Photos / Camera Capture</span>
                    </div>
                    <div className={`photo-count-badge ${images.length >= MAX_IMAGES ? 'maxed' : ''}`}>
                      {images.length} / {MAX_IMAGES} photos
                    </div>
                  </div>

                  {/* Hidden File Input with Camera Capture Support */}
                  <input
                    type="file"
                    accept="image/*"
                    capture="environment"
                    multiple
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    style={{ display: 'none' }}
                  />

                  <div className="photo-tiles-grid">
                    {/* Render Miniature Thumbnail Tiles */}
                    {images.map((imgUrl, index) => (
                      <div
                        key={`${imgUrl.slice(0, 30)}-${index}`}
                        className={`photo-tile photo-tile-thumb ${index === 0 ? 'primary' : ''}`}
                        onClick={() => handleSelectPrimaryImage(index)}
                        title={index === 0 ? 'Main listing photo' : 'Click to make main photo'}
                      >
                        <img src={imgUrl} alt={`Captured item photo ${index + 1}`} />
                        {index === 0 && <span className="photo-tile-badge-main">Main</span>}
                        <button
                          type="button"
                          className="photo-tile-delete"
                          onClick={(e) => handleRemoveImage(index, e)}
                          title="Remove photo"
                        >
                          ✕
                        </button>
                      </div>
                    ))}

                    {/* Action Button Tile to Add / Capture Photos */}
                    {images.length < MAX_IMAGES && (
                      <div
                        className="photo-tile photo-tile-add"
                        onClick={() => fileInputRef.current?.click()}
                        title="Take photo with camera or upload image"
                      >
                        <span className="plus-icon">+</span>
                        <span className="add-text">Capture</span>
                      </div>
                    )}
                  </div>

                  {/* Secondary Options */}
                  <div style={{ marginTop: '10px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <button
                      type="button"
                      onClick={() => setShowUrlInput(!showUrlInput)}
                      style={{
                        background: 'none',
                        border: 'none',
                        color: 'var(--app-subtext)',
                        fontSize: '0.75rem',
                        cursor: 'pointer',
                        padding: 0,
                        textDecoration: 'underline'
                      }}
                    >
                      {showUrlInput ? 'Hide URL input' : '+ Add via image URL'}
                    </button>

                    {images.length >= MAX_IMAGES && (
                      <span style={{ fontSize: '0.75rem', color: '#ef4444', fontWeight: 600 }}>
                        Maximum 5 images limit reached
                      </span>
                    )}
                  </div>

                  {showUrlInput && images.length < MAX_IMAGES && (
                    <div style={{ display: 'flex', gap: '8px', marginTop: '8px' }}>
                      <IonInput
                        value={customUrl}
                        onIonInput={e => setCustomUrl(e.detail.value || '')}
                        placeholder="Paste image URL..."
                        style={{
                          background: 'rgba(255, 255, 255, 0.05)',
                          borderRadius: '8px',
                          paddingLeft: '10px',
                          fontSize: '0.85rem'
                        }}
                      />
                      <IonButton size="small" onClick={handleAddUrlImage}>
                        Add
                      </IonButton>
                    </div>
                  )}
                </div>
              </IonCol>
            </IonRow>

            {/* eBay Listing ID */}
            <IonRow>
              <IonCol size="12">
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

