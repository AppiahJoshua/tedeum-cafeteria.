/* ============================================================
   TE-DEUM L'AUDAMUS — Order Page JS
   ============================================================ */

let cart = JSON.parse(localStorage.getItem('tedeum_cart') || '[]');
let currentStep = 1, selectedPayment = 'momo';

function saveCart() { localStorage.setItem('tedeum_cart', JSON.stringify(cart)); }
function getTotal()  { return cart.reduce((s, i) => s + i.price * i.qty, 0); }

function renderCartItems() {
  const el = document.getElementById('cartItems');
  const empty = document.getElementById('emptyCart');
  const actions = document.getElementById('cartActions');
  if (!cart.length) { if(el) el.innerHTML=''; if(empty) empty.style.display=''; if(actions) actions.style.display='none'; return; }
  if(empty) empty.style.display='none'; if(actions) actions.style.display='';
  if(!el) return;
  el.innerHTML = cart.map(item => `
    <div class="cart-item" id="ci-${item.id}">
      <div class="cart-item-emoji">${item.emoji||'🍽️'}</div>
      <div class="cart-item-info">
        <div class="cart-item-name">${item.name}</div>
        <div class="cart-item-price">GHS ${(item.price*item.qty).toFixed(2)}</div>
      </div>
      <div class="qty-control">
        <button class="qty-btn" onclick="changeQty(${item.id},-1)">−</button>
        <span class="qty-val">${item.qty}</span>
        <button class="qty-btn" onclick="changeQty(${item.id},1)">+</button>
      </div>
      <button class="cart-remove" onclick="removeItem(${item.id})">✕</button>
    </div>`).join('');
}

function renderSummary() {
  const el = document.getElementById('summaryItems');
  const totalEl = document.getElementById('summaryTotal');
  if(!el) return;
  if(!cart.length){ el.innerHTML='<p style="color:var(--text-muted);font-size:.84rem;padding:7px 0">No items yet.</p>'; if(totalEl) totalEl.textContent='GHS 0.00'; return; }
  el.innerHTML = cart.map(item => `<div class="summary-row"><span class="label">${item.name} x${item.qty}</span><span>GHS ${(item.price*item.qty).toFixed(2)}</span></div>`).join('');
  if(totalEl) totalEl.textContent = 'GHS ' + getTotal().toFixed(2);
}

function changeQty(id, d) {
  const item = cart.find(i => i.id===id); if(!item) return;
  item.qty += d; if(item.qty<=0) cart = cart.filter(i=>i.id!==id);
  saveCart(); renderCartItems(); renderSummary();
}
function removeItem(id) { cart=cart.filter(i=>i.id!==id); saveCart(); renderCartItems(); renderSummary(); }

function goToStep(n) {
  if(n>1&&!cart.length){ showToast('Cart is empty!','error'); return; }
  if(n===3&&currentStep===2){
    const isPickup = document.querySelector('.tab.active')?.dataset.target==='pickup-tab';
    const name  = isPickup?document.getElementById('pick-name')?.value:document.getElementById('del-name')?.value;
    const phone = isPickup?document.getElementById('pick-phone')?.value:document.getElementById('del-phone')?.value;
    if(!name||!phone){ showToast('Please fill in name and phone.','error'); return; }
  }
  currentStep=n;
  document.querySelectorAll('.order-panel').forEach(p=>p.classList.remove('active'));
  document.getElementById('panel-'+n)?.classList.add('active');
  document.querySelectorAll('.step').forEach(s=>{ const sn=parseInt(s.dataset.step); s.classList.remove('active','done'); if(sn===n) s.classList.add('active'); else if(sn<n) s.classList.add('done'); });
  window.scrollTo({top:0,behavior:'smooth'});
}

function selectPay(el) {
  document.querySelectorAll('.payment-opt').forEach(o=>o.classList.remove('selected'));
  el.classList.add('selected'); selectedPayment=el.dataset.pay;
  document.getElementById('momo-fields').style.display  = selectedPayment==='momo'?'':'none';
  document.getElementById('cash-fields').style.display  = selectedPayment==='cash'?'':'none';
  document.getElementById('card-fields').style.display  = selectedPayment==='card'?'':'none';
}

function buildPayload() {
  const isPickup = document.querySelector('.tab.active')?.dataset.target==='pickup-tab';
  return {
    customerName:    isPickup?document.getElementById('pick-name')?.value?.trim():document.getElementById('del-name')?.value?.trim(),
    customerPhone:   isPickup?document.getElementById('pick-phone')?.value?.trim():document.getElementById('del-phone')?.value?.trim(),
    orderType:       isPickup?'pickup':'delivery',
    deliveryAddress: isPickup?null:document.getElementById('del-address')?.value?.trim(),
    deliveryNotes:   isPickup?null:document.getElementById('del-notes')?.value?.trim(),
    paymentMethod:   selectedPayment,
    items:           cart.map(i=>({menuItemId:i.id,quantity:i.qty})),
  };
}

async function placeOrder() {
  const btn = document.getElementById('placeOrderBtn');
  if(btn){ btn.disabled=true; btn.textContent='Processing…'; }
  try {
    const payload  = buildPayload();
    const orderRes = await API.placeOrder(payload);
    const { orderId, orderNumber, total } = orderRes.data;
    if(selectedPayment!=='cash'){
      const email = document.getElementById('pay-email')?.value?.trim()||'guest@example.com';
      const payRes = await API.initPayment({orderId,email});
      const { accessCode, reference, authorizationUrl } = payRes.data;
      if(window.PaystackPop){
        const key = document.querySelector('meta[name="paystack-key"]')?.content||'';
        PaystackPop.setup({ key, email, amount:Math.round(total*100), currency:'GHS', ref:reference, channels:['mobile_money','card'],
          onClose: ()=>{ if(btn){btn.disabled=false;btn.textContent='Place Order';} showToast('Payment cancelled. Order saved.','error'); },
          callback: async r=>{ try{ await API.verifyPayment(r.reference); }catch(e){} showConfirmation(orderNumber,payload.customerPhone); },
        }).openIframe();
      } else { window.location.href = authorizationUrl; }
    } else { showConfirmation(orderNumber, payload.customerPhone); }
  } catch(err) {
    showToast(err.message||'Order failed. Try again.','error');
    if(btn){ btn.disabled=false; btn.textContent='Place Order'; }
  }
}

function showConfirmation(num, phone) {
  const n=document.getElementById('orderIdDisplay'); const p=document.getElementById('confirmPhone');
  if(n) n.textContent=num; if(p) p.textContent=phone;
  cart=[]; saveCart(); goToStep(4);
}

document.querySelectorAll('.tab').forEach(tab=>{
  tab.addEventListener('click',()=>{
    document.querySelectorAll('.tab').forEach(t=>t.classList.remove('active'));
    tab.classList.add('active');
    ['delivery-tab','pickup-tab'].forEach(id=>{ const el=document.getElementById(id); if(el) el.style.display=id===tab.dataset.target?'':'none'; });
  });
});

renderCartItems(); renderSummary();
