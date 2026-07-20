import React, { useState } from 'react';
import {
  IonModal,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonButtons,
  IonButton,
  IonContent,
  IonGrid,
  IonRow,
  IonCol,
  IonIcon,
  IonBadge,
  IonInput,
  IonItem,
  IonLabel,
  IonAlert
} from '@ionic/react';
import {
  closeOutline,
  createOutline,
  trashOutline,
  openOutline,
  checkmarkCircleOutline,
  pricetagOutline,
  cubeOutline,
  locationOutline,
  calendarOutline,
  copyOutline
} from 'ionicons/icons';
import { InventoryItem } from '../types/inventory';
import { useInventory } from '../context/InventoryContext';

interface ItemDetailModalProps {
  item: InventoryItem | null;
  isOpen: boolean;
  onClose: () => void;
  onEdit: (item: InventoryItem) => void;
}

export const ItemDetailModal: React.FC<ItemDetailModalProps> = ({ item, isOpen, onClose, onEdit }) => {
  const { deleteItem, markAsSold } = useInventory();
  const [showSoldPrompt, setShowSoldPrompt] = useState(false);
  const [soldPriceInput, setSoldPriceInput] = useState<string>('');
  const [buyerInput, setBuyerInput] = useState<string>('');
  const [shippingInput, setShippingInput] = useState<string>('5.00');

  if (!item) return null;

  const estimatedFee = (item.listPrice * 0.1325) + 0.30;
  const estimatedNet = item.listPrice - item.purchaseCost - estimatedFee;
  const marginPct = item.listPrice > 0 ? ((estimatedNet / item.listPrice) * 100).toFixed(1) : '0';

  const handleDelete = () => {
    deleteItem(item.id);
    onClose();
  };

  const handleConfirmSold = () => {
    const finalPrice = parseFloat(soldPriceInput) || item.listPrice;
    const shipping = parseFloat(shippingInput) || 0;
    markAsSold(item.id, finalPrice, buyerInput || 'ebay_buyer', shipping);
    setShowSoldPrompt(false);
    onClose();
  };

  return (
    <>
      <IonModal isOpen={isOpen} onDidDismiss={onClose}>
        <IonHeader>
          <IonToolbar color="dark">
            <IonTitle>Item Details</IonTitle>
            <IonButtons slot="end">
              <IonButton onClick={onClose}>
                <IonIcon icon={closeOutline} />
              </IonButton>
            </IonButtons>
          </IonToolbar>
        </IonHeader>

        <IonContent className="ion-padding">
          <IonGrid>
            {/* Header Image & Status Row */}
            <IonRow className="ion-margin-bottom">
              <IonCol size="12" sizeMd="5">
                <img
                  src={item.imageUrl}
                  alt={item.title}
                  style={{
                    width: '100%',
                    height: '240px',
                    objectFit: 'cover',
                    borderRadius: '12px',
                    border: '1px solid var(--app-card-border)'
                  }}
                />
              </IonCol>

              <IonCol size="12" sizeMd="7" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px', flexWrap: 'wrap' }}>
                    <span className={`status-pill ${item.status.toLowerCase()}`}>
                      {item.status}
                    </span>
                    <span className="bin-tag">
                      <IonIcon icon={locationOutline} /> {item.locationBin}
                    </span>
                    <span className="item-sku">{item.sku}</span>
                  </div>

                  <h2 style={{ fontSize: '1.25rem', fontWeight: 800, margin: '8px 0', lineHeight: 1.3 }}>
                    {item.title}
                  </h2>

                  <p style={{ color: 'var(--app-subtext)', fontSize: '0.85rem', margin: '4px 0' }}>
                    Category: <strong>{item.category}</strong> • Condition: <strong>{item.condition}</strong>
                  </p>
                </div>

                <div style={{ marginTop: '16px', background: 'var(--app-card-bg)', padding: '12px 16px', borderRadius: '12px', border: '1px solid var(--app-card-border)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                    <div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--app-subtext)', textTransform: 'uppercase' }}>Target Price</div>
                      <div style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--ion-text-color)' }}>
                        ${item.listPrice.toFixed(2)}
                      </div>
                    </div>

                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontSize: '0.75rem', color: 'var(--app-subtext)', textTransform: 'uppercase' }}>Cost / Profit</div>
                      <div style={{ fontSize: '1.1rem', fontWeight: 700, color: '#10b981' }}>
                        +${estimatedNet.toFixed(2)} ({marginPct}%)
                      </div>
                    </div>
                  </div>
                </div>
              </IonCol>
            </IonRow>

            {/* Financial Breakdown Table */}
            <IonRow className="ion-margin-bottom">
              <IonCol size="12">
                <div style={{ background: 'var(--app-card-bg)', border: '1px solid var(--app-card-border)', borderRadius: '12px', padding: '16px' }}>
                  <h4 style={{ margin: '0 0 12px 0', fontSize: '0.9rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--app-subtext)' }}>
                    Financial & Metrics Breakdown
                  </h4>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '12px' }}>
                    <div>
                      <span style={{ fontSize: '0.75rem', color: 'var(--app-subtext)' }}>Purchase Cost</span>
                      <div style={{ fontWeight: 700, fontSize: '1rem' }}>${item.purchaseCost.toFixed(2)}</div>
                    </div>

                    <div>
                      <span style={{ fontSize: '0.75rem', color: 'var(--app-subtext)' }}>Est. eBay Fee (13.25%+$0.30)</span>
                      <div style={{ fontWeight: 700, fontSize: '1rem', color: '#ef4444' }}>-${estimatedFee.toFixed(2)}</div>
                    </div>

                    <div>
                      <span style={{ fontSize: '0.75rem', color: 'var(--app-subtext)' }}>Est. Net Profit</span>
                      <div style={{ fontWeight: 700, fontSize: '1rem', color: '#10b981' }}>${estimatedNet.toFixed(2)}</div>
                    </div>

                    <div>
                      <span style={{ fontSize: '0.75rem', color: 'var(--app-subtext)' }}>Quantity</span>
                      <div style={{ fontWeight: 700, fontSize: '1rem' }}>{item.quantity} units</div>
                    </div>
                  </div>
                </div>
              </IonCol>
            </IonRow>

            {/* Notes & eBay Link */}
            {item.notes && (
              <IonRow className="ion-margin-bottom">
                <IonCol size="12">
                  <div style={{ background: 'rgba(255, 255, 255, 0.03)', border: '1px dashed var(--app-card-border)', padding: '12px 16px', borderRadius: '10px' }}>
                    <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--app-subtext)', textTransform: 'uppercase' }}>Notes & Serial / Details</div>
                    <p style={{ margin: '4px 0 0 0', fontSize: '0.9rem', color: 'var(--ion-text-color)' }}>{item.notes}</p>
                  </div>
                </IonCol>
              </IonRow>
            )}

            {item.ebayUrl && (
              <IonRow className="ion-margin-bottom">
                <IonCol size="12">
                  <IonButton
                    expand="block"
                    fill="outline"
                    color="primary"
                    href={item.ebayUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <IonIcon slot="start" icon={openOutline} />
                    View Live Listing on eBay ({item.ebayListingId})
                  </IonButton>
                </IonCol>
              </IonRow>
            )}

            {/* Actions Bar */}
            <IonRow className="ion-margin-top" style={{ gap: '8px' }}>
              {item.status === 'Active' && (
                <IonCol size="12">
                  <IonButton
                    expand="block"
                    color="success"
                    onClick={() => {
                      setSoldPriceInput(item.listPrice.toString());
                      setShowSoldPrompt(true);
                    }}
                  >
                    <IonIcon slot="start" icon={checkmarkCircleOutline} />
                    Mark as Sold (Log Sale)
                  </IonButton>
                </IonCol>
              )}

              <IonCol size="6">
                <IonButton
                  expand="block"
                  fill="outline"
                  color="medium"
                  onClick={() => {
                    onClose();
                    onEdit(item);
                  }}
                >
                  <IonIcon slot="start" icon={createOutline} />
                  Edit Item
                </IonButton>
              </IonCol>

              <IonCol size="6">
                <IonButton
                  expand="block"
                  fill="outline"
                  color="danger"
                  onClick={handleDelete}
                >
                  <IonIcon slot="start" icon={trashOutline} />
                  Delete
                </IonButton>
              </IonCol>
            </IonRow>
          </IonGrid>
        </IonContent>
      </IonModal>

      {/* Mark as Sold Modal Prompt */}
      <IonModal isOpen={showSoldPrompt} onDidDismiss={() => setShowSoldPrompt(false)}>
        <IonHeader>
          <IonToolbar color="dark">
            <IonTitle>Log eBay Sale</IonTitle>
            <IonButtons slot="end">
              <IonButton onClick={() => setShowSoldPrompt(false)}>
                <IonIcon icon={closeOutline} />
              </IonButton>
            </IonButtons>
          </IonToolbar>
        </IonHeader>

        <IonContent className="ion-padding">
          <IonGrid>
            <IonRow>
              <IonCol size="12">
                <p style={{ color: 'var(--app-subtext)' }}>
                  Record the final sale price and details for <strong>{item.title}</strong>:
                </p>
              </IonCol>

              <IonCol size="12">
                <IonItem className="ion-margin-bottom">
                  <IonLabel position="stacked">Final Sale Price ($)</IonLabel>
                  <IonInput
                    type="number"
                    step="0.01"
                    value={soldPriceInput}
                    onIonInput={e => setSoldPriceInput(e.detail.value || '')}
                  />
                </IonItem>
              </IonCol>

              <IonCol size="6">
                <IonItem className="ion-margin-bottom">
                  <IonLabel position="stacked">Shipping Label Cost ($)</IonLabel>
                  <IonInput
                    type="number"
                    step="0.01"
                    value={shippingInput}
                    onIonInput={e => setShippingInput(e.detail.value || '')}
                  />
                </IonItem>
              </IonCol>

              <IonCol size="6">
                <IonItem className="ion-margin-bottom">
                  <IonLabel position="stacked">Buyer Username</IonLabel>
                  <IonInput
                    value={buyerInput}
                    onIonInput={e => setBuyerInput(e.detail.value || '')}
                    placeholder="e.g. buyer_42"
                  />
                </IonItem>
              </IonCol>

              <IonCol size="6">
                <IonButton expand="block" fill="outline" onClick={() => setShowSoldPrompt(false)}>
                  Cancel
                </IonButton>
              </IonCol>

              <IonCol size="6">
                <IonButton expand="block" color="success" onClick={handleConfirmSold}>
                  Confirm & Log Profit
                </IonButton>
              </IonCol>
            </IonRow>
          </IonGrid>
        </IonContent>
      </IonModal>
    </>
  );
};
