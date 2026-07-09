document.addEventListener('DOMContentLoaded', async () => {
  // Navigation interaction
  const navItems = document.querySelectorAll('.nav-item');
  navItems.forEach(item => {
    item.addEventListener('click', () => {
      navItems.forEach(nav => nav.classList.remove('active'));
      item.classList.add('active');
    });
  });

  const checklistContainer = document.getElementById('checklist-container');
  const routeInfo = document.getElementById('route-info');
  const requirementSelect = document.getElementById('requirementSelect');
  
  const originSelect = document.getElementById('originSelect');
  const destSelect = document.getElementById('destSelect');
  const changeRouteBtn = document.getElementById('changeRouteBtn');
  
  const costDescription = document.getElementById('cost-description');
  const costAmount = document.getElementById('cost-amount');
  const placesContainer = document.getElementById('places-container');
  
  // Función para obtener y renderizar los datos
  async function loadData() {
      try {
          const response = await fetch('/api/requirements');
          const data = await response.json();
          const { route, requirements } = data;
          
          if (!requirements || requirements.length === 0) {
              checklistContainer.innerHTML = '<p>No hay requisitos para esta ruta. Escoge una arriba y presiona Cambiar.</p>';
              routeInfo.innerHTML = '<p>Configura tu ruta.</p>';
              return;
          }
          
          // Actualizar los selects para que muestren la ruta actual
          if (route) {
              originSelect.value = route.origin;
              destSelect.value = route.destination;
          }
          
          // Render Route info
          routeInfo.innerHTML = `
              <p><strong>${route ? route.origin : 'Origen'} → ${route ? route.destination : 'Destino'}</strong></p>
              <p style="color:var(--muted); margin-top:6px;">Motivo: ${route ? route.reason : 'Estudios'}</p>
              <div class="progress"><span></span></div>
              <p style="color:var(--danger); font-weight:800;">${requirements.filter(r => r.isCritical && r.status !== 'VALIDATED').length} requisitos críticos pendientes</p>
          `;
          
          if (route && costDescription && costAmount && placesContainer) {
              const dest = route.destination;
              let cost = '';
              let mainPlace = '';
              let mainPlaceDesc = '';
              
              if (dest === 'España') {
                  cost = '€ 4,480';
                  mainPlace = 'Consulado General de España en Lima';
                  mainPlaceDesc = 'Visado y legalizaciones';
              } else if (dest === 'EE.UU.') {
                  cost = '$ 3,200 USD';
                  mainPlace = 'Embajada de EE.UU. en Lima';
                  mainPlaceDesc = 'Entrevista para Visa F-1';
              } else if (dest === 'Canadá') {
                  cost = 'CAD 2,800';
                  mainPlace = 'Centro de Solicitud de Visas (VAC) Lima';
                  mainPlaceDesc = 'Datos biométricos y Study Permit';
              } else if (dest === 'Alemania') {
                  cost = '€ 11,208'; // Sperrkonto
                  mainPlace = 'Embajada de Alemania en Lima';
                  mainPlaceDesc = 'Visa Nacional de Estudios';
              } else if (dest === 'Argentina') {
                  cost = '$ 950 USD'; // Estimación referencial mudanza y trámites
                  mainPlace = 'Dirección Nacional de Migraciones (Argentina)';
                  mainPlaceDesc = 'Trámite de Residencia MERCOSUR';
              } else {
                  cost = '$ 1,200 USD'; // Genérico LatAm
                  mainPlace = `Consulado de ${dest} en Lima`;
                  mainPlaceDesc = 'Trámites de visado/residencia';
              }

              costDescription.innerText = `Estimación referencial para tramitar estudios en ${dest}.`;
              costAmount.innerText = cost;
              
              placesContainer.innerHTML = `
                <div style="border-top: 1px solid var(--border); padding-top: 15px; margin-top: 10px;">
                  <div style="display: flex; justify-content: space-between; align-items: center;">
                    <div>
                      <strong>${mainPlace}</strong>
                      <div style="color:var(--muted); font-size: 13px;">${mainPlaceDesc}</div>
                    </div>
                    <a href="#" style="color:var(--primary); font-weight: 600; text-decoration: none;">Ver mapa</a>
                  </div>
                </div>
                <div style="border-top: 1px solid var(--border); padding-top: 15px; margin-top: 15px;">
                  <div style="display: flex; justify-content: space-between; align-items: center;">
                    <div>
                      <strong>Ministerio de RREE / Interpol Perú</strong>
                      <div style="color:var(--muted); font-size: 13px;">Apostillas y Antecedentes</div>
                    </div>
                    <a href="#" style="color:var(--primary); font-weight: 600; text-decoration: none;">Ver mapa</a>
                  </div>
                </div>
              `;
          }
          
          // Render Checklist
          checklistContainer.innerHTML = '';
          requirementSelect.innerHTML = '<option value="">Selecciona el requisito a validar...</option>';
          
          requirements.forEach(req => {
              let statusClass = 'bad';
              let statusText = 'Pendiente';
              if (req.status === 'VALIDATED') { statusClass = 'ok'; statusText = 'Validado'; }
              else if (req.status === 'IN_REVIEW') { statusClass = 'warn'; statusText = 'En revisión'; }
              else if (req.status === 'REJECTED') { statusClass = 'bad'; statusText = 'Rechazado'; }
              
              checklistContainer.innerHTML += `
                <div class="row">
                    <div>
                        <strong>${req.title}</strong>
                        <small>${req.source}</small>
                    </div>
                    <span class="status ${statusClass}">${statusText}</span>
                </div>
              `;
              
              if (req.status !== 'VALIDATED') {
                requirementSelect.innerHTML += `<option value="${req.id}">${req.title}</option>`;
              }
          });
          
      } catch (e) {
          console.error(e);
          checklistContainer.innerHTML = '<p>Error conectando a la base de datos.</p>';
      }
  }
  
  // Cambiar ruta
  if (changeRouteBtn) {
      changeRouteBtn.addEventListener('click', async () => {
          const origin = originSelect.value;
          const destination = destSelect.value;
          
          changeRouteBtn.innerText = 'Cargando...';
          changeRouteBtn.disabled = true;
          
          try {
              await fetch('/api/route', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ origin, destination })
              });
              await loadData();
          } catch (e) {
              alert('Error al cambiar la ruta');
          }
          
          changeRouteBtn.innerText = 'Cambiar';
          changeRouteBtn.disabled = false;
      });
  }
  
  // Cargar datos iniciales
  await loadData();

  // Upload form interaction
  const uploadForm = document.getElementById('uploadForm');
  const uploadBtn = document.getElementById('uploadBtn');
  const sessionStartTime = Date.now();

  if (uploadForm) {
    uploadForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      
      const sessionTimeSeconds = Math.floor((Date.now() - sessionStartTime) / 1000);
      
      uploadBtn.innerText = 'Validando de fuente oficial...';
      uploadBtn.disabled = true;

      const formData = new FormData(uploadForm);
      formData.append('sessionTime', sessionTimeSeconds);
      
      try {
        const response = await fetch('/api/upload', {
            method: 'POST',
            body: formData
        });
        
        const data = await response.json();
        
        setTimeout(async () => {
            if (response.ok) {
                uploadBtn.innerText = 'Documento Válido ✅';
                uploadBtn.style.background = '#12b886';
                alert(`¡Documento oficial validado con éxito! Tiempo de sesión validado: ${sessionTimeSeconds}s`);
                
                await loadData();
                uploadForm.reset();
                setTimeout(() => {
                    uploadBtn.innerText = 'Analizar otro documento';
                    uploadBtn.style.background = 'var(--primary)';
                    uploadBtn.disabled = false;
                }, 3000);
            } else {
                uploadBtn.innerText = 'Error ❌';
                uploadBtn.style.background = '#fa5252';
                alert('Error: ' + data.error);
                uploadBtn.disabled = false;
            }
        }, 1500); 
        
      } catch (err) {
        uploadBtn.innerText = 'Error ❌';
        uploadBtn.style.background = '#fa5252';
        uploadBtn.disabled = false;
      }
    });
  }
});
