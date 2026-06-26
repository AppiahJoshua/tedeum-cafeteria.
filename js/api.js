/* ============================================================
   TE-DEUM L'AUDAMUS — API Client
   ============================================================ */

const API = (() => {
  const BASE = window.location.origin + '/api';
  const getToken  = () => localStorage.getItem('tedeum_admin_token');
  const setToken  = t  => localStorage.setItem('tedeum_admin_token', t);
  const clearToken= () => localStorage.removeItem('tedeum_admin_token');

  function headers(admin = false) {
    const h = { 'Content-Type': 'application/json' };
    if (admin) { const t = getToken(); if (t) h['Authorization'] = 'Bearer ' + t; }
    return h;
  }

  async function request(method, path, body = null, admin = false) {
    const opts = { method, headers: headers(admin) };
    if (body) opts.body = JSON.stringify(body);
    try {
      const res  = await fetch(BASE + path, opts);
      const data = await res.json();
      if (!res.ok) throw { status: res.status, message: data.message || 'Request failed', data };
      return data;
    } catch (err) {
      if (err.status) throw err;
      throw { status: 0, message: 'Network error. Check your connection.' };
    }
  }

  return {
    login:        (u, p) => request('POST', '/auth/login', { username: u, password: p }),
    verifyToken:  ()     => request('GET',  '/auth/verify', null, true),
    logout:       ()     => { clearToken(); window.location.href = '/admin.html'; },
    getToken, setToken, clearToken,

    getMenu:        (p={}) => request('GET', '/menu?' + new URLSearchParams(p)),
    addMenuItem:    d      => request('POST',   '/menu',       d,    true),
    updateMenuItem: (id,d) => request('PUT',    '/menu/'+id,   d,    true),
    toggleMenuItem: id     => request('PATCH',  '/menu/'+id+'/toggle', null, true),
    deleteMenuItem: id     => request('DELETE', '/menu/'+id,   null, true),
    uploadMenuImage: async (id, file) => {
      const fd = new FormData(); fd.append('image', file);
      const t = getToken();
      const res  = await fetch(BASE + '/menu/' + id + '/image', { method:'POST', headers: t ? { Authorization:'Bearer '+t } : {}, body: fd });
      const data = await res.json();
      if (!res.ok) throw { status: res.status, message: data.message || 'Upload failed' };
      return data;
    },
    removeMenuImage: id => request('DELETE', '/menu/'+id+'/image', null, true),

    placeOrder:        d      => request('POST', '/orders',              d),
    getOrders:         (p={}) => request('GET',  '/orders?'+new URLSearchParams(p), null, true),
    updateOrderStatus: (id,s) => request('PUT',  '/orders/'+id+'/status', {status:s}, true),

    makeReservation:   d      => request('POST', '/reservations',              d),
    getReservations:   (p={}) => request('GET',  '/reservations?'+new URLSearchParams(p), null, true),
    updateReservation: (id,s) => request('PUT',  '/reservations/'+id+'/status', {status:s}, true),

    submitReview:  d   => request('POST',   '/reviews',              d),
    getReviews:    all => request('GET',    '/reviews'+(all?'?all=true':''), null, all),
    approveReview: id  => request('PUT',    '/reviews/'+id+'/approve', null, true),
    deleteReview:  id  => request('DELETE', '/reviews/'+id,  null, true),

    sendMessage:  d  => request('POST', '/contact',              d),
    getMessages:  () => request('GET',  '/contact',              null, true),

    registerLoyalty: d  => request('POST', '/loyalty/register',    d),
    getMember:       ph => request('GET',  '/loyalty/member/'+ph),

    initPayment:   d   => request('POST', '/payments/initialize',  d),
    verifyPayment: ref => request('GET',  '/payments/verify/'+ref),

    getDashboardStats: () => request('GET', '/dashboard/stats', null, true),
  };
})();
window.API = API;
