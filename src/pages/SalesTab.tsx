import React from 'react';
import {
  IonPage,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonGrid,
  IonRow,
  IonCol,
  IonIcon,
  IonBadge
} from '@ionic/react';
import {
  bagCheckOutline,
  cashOutline,
  trendingUpOutline,
  receiptOutline,
  personOutline,
  calendarOutline
} from 'ionicons/icons';
import { useInventory } from '../context/InventoryContext';

export const SalesTab: React.FC = () => {
  const { sales } = useInventory();

  const totalGross = sales.reduce((acc, curr) => acc + curr.salePrice, 0);
  const totalCost = sales.reduce((acc, curr) => acc + curr.purchaseCost, 0);
  const totalFees = sales.reduce((acc, curr) => {
    const fee = (curr.salePrice * (curr.ebayFeePct / 100)) + curr.ebayFeeFixed;
    return acc + fee;
  }, 0);
  const totalShipping = sales.reduce((acc, curr) => acc + curr.shippingLabelCost, 0);
  const totalNetProfit = sales.reduce((acc, curr) => acc + curr.netProfit, 0);
  const avgNetProfit = sales.length > 0 ? (totalNetProfit / sales.length) : 0;

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar color="dark">
          <IonTitle>Sales & Realized Profit Ledger</IonTitle>
        </IonToolbar>
      </IonHeader>

      <IonContent className="ion-padding">
        <IonGrid>
          {/* Summary Metrics */}
          <IonRow className="ion-margin-bottom">
            <IonCol size="12" sizeSm="6" sizeLg="3">
              <div className="metric-card">
                <div className="metric-icon-wrapper" style={{ background: 'rgba(59, 130, 246, 0.15)', color: '#3b82f6' }}>
                  <IonIcon icon={cashOutline} />
                </div>
                <div className="metric-label">Gross Sales Revenue</div>
                <div className="metric-value">${totalGross.toFixed(2)}</div>
                <div className="metric-sub" style={{ color: 'var(--app-subtext)' }}>
                  Across {sales.length} completed transactions
                </div>
              </div>
            </IonCol>

            <IonCol size="12" sizeSm="6" sizeLg="3">
              <div className="metric-card">
                <div className="metric-icon-wrapper" style={{ background: 'rgba(16, 185, 129, 0.15)', color: '#10b981' }}>
                  <IonIcon icon={trendingUpOutline} />
                </div>
                <div className="metric-label">Net Realized Profit</div>
                <div className="metric-value" style={{ color: '#10b981' }}>
                  +${totalNetProfit.toFixed(2)}
                </div>
                <div className="metric-sub" style={{ color: '#10b981' }}>
                  Avg +${avgNetProfit.toFixed(2)} / sale
                </div>
              </div>
            </IonCol>

            <IonCol size="12" sizeSm="6" sizeLg="3">
              <div className="metric-card">
                <div className="metric-icon-wrapper" style={{ background: 'rgba(239, 68, 68, 0.15)', color: '#ef4444' }}>
                  <IonIcon icon={receiptOutline} />
                </div>
                <div className="metric-label">Total eBay Fees Paid</div>
                <div className="metric-value" style={{ color: '#ef4444' }}>
                  -${totalFees.toFixed(2)}
                </div>
                <div className="metric-sub" style={{ color: 'var(--app-subtext)' }}>
                  Final value fees & fixed per-order
                </div>
              </div>
            </IonCol>

            <IonCol size="12" sizeSm="6" sizeLg="3">
              <div className="metric-card">
                <div className="metric-icon-wrapper" style={{ background: 'rgba(245, 158, 11, 0.15)', color: '#f59e0b' }}>
                  <IonIcon icon={bagCheckOutline} />
                </div>
                <div className="metric-label">Shipping Label Costs</div>
                <div className="metric-value" style={{ color: '#f59e0b' }}>
                  -${totalShipping.toFixed(2)}
                </div>
                <div className="metric-sub" style={{ color: 'var(--app-subtext)' }}>
                  Out-of-pocket shipping labels
                </div>
              </div>
            </IonCol>
          </IonRow>

          {/* Sales Ledger Table */}
          <IonRow>
            <IonCol size="12">
              <div style={{ background: 'var(--app-card-bg)', border: '1px solid var(--app-card-border)', borderRadius: '16px', padding: '20px' }}>
                <h3 style={{ margin: '0 0 16px 0', fontWeight: 800, fontSize: '1.25rem', fontFamily: 'var(--ion-heading-font-family)' }}>
                  Completed Transactions Ledger
                </h3>

                {sales.length === 0 ? (
                  <p style={{ color: 'var(--app-subtext)' }}>No completed sales recorded yet. Mark an active item as sold to log profit.</p>
                ) : (
                  <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem' }}>
                      <thead>
                        <tr style={{ borderBottom: '1px solid var(--app-card-border)', color: 'var(--app-subtext)', textAlign: 'left' }}>
                          <th style={{ padding: '12px 8px' }}>Date</th>
                          <th style={{ padding: '12px 8px' }}>Item Title & SKU</th>
                          <th style={{ padding: '12px 8px' }}>Buyer</th>
                          <th style={{ padding: '12px 8px', textAlign: 'right' }}>Sale Price</th>
                          <th style={{ padding: '12px 8px', textAlign: 'right' }}>Cost</th>
                          <th style={{ padding: '12px 8px', textAlign: 'right' }}>eBay Fee</th>
                          <th style={{ padding: '12px 8px', textAlign: 'right' }}>Shipping</th>
                          <th style={{ padding: '12px 8px', textAlign: 'right' }}>Net Profit</th>
                        </tr>
                      </thead>
                      <tbody>
                        {sales.map(sale => {
                          const fee = (sale.salePrice * (sale.ebayFeePct / 100)) + sale.ebayFeeFixed;

                          return (
                            <tr key={sale.id} style={{ borderBottom: '1px solid var(--app-card-border)' }}>
                              <td style={{ padding: '12px 8px', whiteSpace: 'nowrap', color: 'var(--app-subtext)' }}>
                                {sale.saleDate}
                              </td>

                              <td style={{ padding: '12px 8px' }}>
                                <div style={{ fontWeight: 700 }}>{sale.itemTitle}</div>
                                <span className="item-sku">{sale.sku}</span>
                              </td>

                              <td style={{ padding: '12px 8px', whiteSpace: 'nowrap' }}>
                                @{sale.buyerUsername}
                              </td>

                              <td style={{ padding: '12px 8px', textAlign: 'right', fontWeight: 700 }}>
                                ${sale.salePrice.toFixed(2)}
                              </td>

                              <td style={{ padding: '12px 8px', textAlign: 'right', color: 'var(--app-subtext)' }}>
                                ${sale.purchaseCost.toFixed(2)}
                              </td>

                              <td style={{ padding: '12px 8px', textAlign: 'right', color: '#ef4444' }}>
                                -${fee.toFixed(2)}
                              </td>

                              <td style={{ padding: '12px 8px', textAlign: 'right', color: '#f59e0b' }}>
                                -${sale.shippingLabelCost.toFixed(2)}
                              </td>

                              <td style={{ padding: '12px 8px', textAlign: 'right' }}>
                                <span className="profit-pill" style={{ fontSize: '0.9rem' }}>
                                  +${sale.netProfit.toFixed(2)}
                                </span>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </IonCol>
          </IonRow>
        </IonGrid>
      </IonContent>
    </IonPage>
  );
};
