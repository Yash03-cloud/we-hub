async function loadAdminData() {
  const res = await fetch("/admin/api/data");
  const data = await res.json();

  loadTable("usersTable", data.users, ["firstName", "lastName", "email", "phone"]);
  loadTable("contactsTable", data.contacts, ["firstName", "email", "subject", "message"]);

  // Reports: show map link when coords are available
  loadTable("reportsTable", data.reports, ["name", "location", "description", "contact", "map"] , (item, field) => {
    if (field === 'map') {
      if (item.latitude && item.longitude) {
        const url = `https://www.google.com/maps/search/?api=1&query=${item.latitude},${item.longitude}`;
        return `<a href="${url}" target="_blank">Open Map</a>`;
      }
      return '-';
    }
    return defaultRenderer(item, field);
  });

  // Live locations: include map link and formatted timestamp
  loadTable("locationsTable", data.locations, ["userId", "latitude", "longitude", "timestamp", "map"], (item, field) => {
    if (field === 'map') {
      if (item.latitude && item.longitude) {
        const url = `https://www.google.com/maps/search/?api=1&query=${item.latitude},${item.longitude}`;
        return `<a href="${url}" target="_blank">Open Map</a>`;
      }
      return '-';
    }
    if (field === 'timestamp') return new Date(item.timestamp).toLocaleString();
    return defaultRenderer(item, field);
  });

  // SOS contacts: include saved coordinates and map link
  loadTable("sosTable", data.sos, ["number", "latitude", "longitude", "createdAt", "map"], (item, field) => {
    if (field === 'map') {
      if (item.latitude && item.longitude) {
        const url = `https://www.google.com/maps/search/?api=1&query=${item.latitude},${item.longitude}`;
        return `<a href="${url}" target="_blank">Open Map</a>`;
      }
      return '-';
    }
    if (field === 'createdAt') return new Date(item.createdAt).toLocaleString();
    return defaultRenderer(item, field);
  });
}

function defaultRenderer(item, field) {
  if (!item) return '-';
  const v = item[field];
  if (v === undefined || v === null) return '-';
  return String(v);
}

function loadTable(id, items, fields, renderer) {
  let table = document.getElementById(id);
  table.innerHTML = "";

  // Header
  let header = "<tr>";
  fields.forEach(f => header += `<th>${f}</th>`);
  header += "</tr>";
  table.innerHTML += header;

  // Rows
  items.forEach(item => {
    let row = "<tr>";
    fields.forEach(f => {
      let cell = renderer ? renderer(item, f) : defaultRenderer(item, f);
      row += `<td>${cell}</td>`;
    });
    row += "</tr>";
    table.innerHTML += row;
  });
}

loadAdminData();


async function loadContacts() {
  const res = await fetch("https://we-hub.onrender.com/api/contacts");
  const contacts = await res.json();

  const tbody = document.querySelector("#contactsTable tbody");
  tbody.innerHTML = "";

  contacts.forEach(c => {
    const row = `
      <tr>
        <td>${c.firstName} ${c.lastName}</td>
        <td>${c.email}</td>
        <td>${c.phone || "-"}</td>
        <td>${c.subject}</td>
        <td>${c.message}</td>
        <td>${new Date(c.createdAt).toLocaleString()}</td>
      </tr>
    `;
    tbody.innerHTML += row;
  });
}

loadContacts();


