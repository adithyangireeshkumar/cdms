document.addEventListener('DOMContentLoaded', () => {
    const caseList = document.getElementById('case-list');
    const stationFilter = document.getElementById('station-filter');
    const applyFiltersBtn = document.getElementById('apply-filters');
    const resetFiltersBtn = document.getElementById('reset-filters');
    const modal = document.getElementById('case-modal');
    const closeModal = document.querySelector('.close-modal');
    const modalBody = document.getElementById('modal-body');
    const totalCount = document.getElementById('total-count');
    const activeCount = document.getElementById('active-count');

    // Fetch and populate stations in dropdown
    fetchStations();

    // Initial Load
    fetchCases();

    // Event Listeners
    applyFiltersBtn.addEventListener('click', fetchCases);
    resetFiltersBtn.addEventListener('click', resetFilters);
    closeModal.addEventListener('click', () => modal.classList.add('hidden'));
    window.addEventListener('click', (e) => {
        if (e.target === modal) modal.classList.add('hidden');
    });

    async function fetchStations() {
        try {
            const res = await fetch('/api/stations');
            const stations = await res.json();
            stations.forEach(s => {
                const opt = document.createElement('option');
                opt.value = s.id;
                opt.textContent = s.name;
                stationFilter.appendChild(opt);
            });
        } catch (err) {
            console.error('Error fetching stations:', err);
        }
    }

    async function fetchCases() {
        const search = document.getElementById('search').value;
        const station_id = document.getElementById('station-filter').value;
        const crime_type = document.getElementById('type-filter').value;
        const status = document.getElementById('status-filter').value;
        const start_date = document.getElementById('start-date').value;
        const end_date = document.getElementById('end-date').value;

        const params = new URLSearchParams({ search, station_id, crime_type, status, start_date, end_date });

        try {
            caseList.innerHTML = '<tr><td colspan="6" style="text-align:center">Loading cases...</td></tr>';
            const res = await fetch(`/api/firs?${params.toString()}`);
            const cases = await res.json();

            displayCases(cases);
            updateStats(cases);
        } catch (err) {
            console.error('Error fetching cases:', err);
            caseList.innerHTML = '<tr><td colspan="6" style="text-align:center; color:red">Error loading cases.</td></tr>';
        }
    }

    function displayCases(cases) {
        caseList.innerHTML = '';
        if (cases.length === 0) {
            document.getElementById('no-data').classList.remove('hidden');
            return;
        }
        document.getElementById('no-data').classList.add('hidden');

        cases.forEach(c => {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td style="font-weight:600">${c.fir_number}</td>
                <td>${formatDate(c.reported_at)}</td>
                <td>${c.crime_type}</td>
                <td>${c.station_name}</td>
                <td><span class="badge ${getStatusClass(c.status)}">${c.status}</span></td>
                <td><button class="view-btn" onclick="viewCaseDetail(${c.id})">View Detail</button></td>
            `;
            caseList.appendChild(tr);
        });
    }

    function updateStats(cases) {
        totalCount.textContent = cases.length;
        const active = cases.filter(c => c.status === 'Under Investigation').length;
        activeCount.textContent = active;
    }

    function resetFilters() {
        document.getElementById('search').value = '';
        document.getElementById('station-filter').value = '';
        document.getElementById('type-filter').value = '';
        document.getElementById('status-filter').value = '';
        document.getElementById('start-date').value = '';
        document.getElementById('end-date').value = '';
        fetchCases();
    }

    window.viewCaseDetail = async function (id) {
        try {
            const res = await fetch(`/api/firs/${id}`);
            const data = await res.json();
            showModal(data);
        } catch (err) {
            alert('Error loading case details');
        }
    };

    function showModal(data) {
        const { fir, follow_ups, news } = data;
        modalBody.innerHTML = `
            <div class="detail-header">
                <h2>FIR No: ${fir.fir_number}</h2>
                <p>KERALA POLICE | FIRST INFORMATION REPORT</p>
            </div>
            
            <div class="fir-sections">
                <section class="fir-sec">
                    <h4>1. Police Station Details</h4>
                    <p><strong>PS Name:</strong> ${fir.station_name}</p>
                    <p><strong>District:</strong> Ernakulam</p>
                    <p><strong>FIR Number:</strong> ${fir.fir_number}</p>
                    <p><strong>Date & Time of Reg:</strong> ${formatDate(fir.reported_at)}</p>
                </section>

                <section class="fir-sec">
                    <h4>2. Type of Information</h4>
                    <p>${fir.information_type}</p>
                </section>

                <section class="fir-sec">
                    <h4>3. Complainant Details (Censored)</h4>
                    <p><strong>Name:</strong> ${fir.complainant_name}</p>
                    <p><strong>Age/Gender:</strong> ${fir.complainant_age} / Male</p>
                    <p><strong>Address:</strong> ${fir.complainant_address}</p>
                </section>

                <section class="fir-sec">
                    <h4>4. Place of Occurrence</h4>
                    <p><strong>Location:</strong> ${fir.incident_location}</p>
                    <p><strong>Distance from PS:</strong> ${fir.distance_from_ps}</p>
                </section>

                <section class="fir-sec">
                    <h4>5. Date & Time of Occurrence</h4>
                    <p>${formatDate(fir.occurrence_at)}</p>
                </section>

                <section class="fir-sec">
                    <h4>6. Offense Details</h4>
                    <p><strong>Nature:</strong> ${fir.crime_type}</p>
                    <p><strong>Sections:</strong> ${fir.ipc_sections}</p>
                </section>

                <section class="fir-sec">
                    <h4>7. Accused Details</h4>
                    <p>${fir.accused_details}</p>
                </section>

                <section class="fir-sec">
                    <h4>8. Description of Incident</h4>
                    <p style="font-style: italic;">"${fir.incident_description}"</p>
                </section>

                <section class="fir-sec">
                    <h4>9. Witness Details</h4>
                    <p>${fir.witness_details}</p>
                </section>

                <section class="fir-sec">
                    <h4>10. Property Involved</h4>
                    <p>${fir.property_details}</p>
                </section>

                <section class="fir-sec">
                    <h4>11. Action Taken</h4>
                    <p><strong>Investigation Started:</strong> Yes</p>
                    <p><strong>Officer:</strong> ${fir.officer_name} (${fir.officer_rank})</p>
                </section>
            </div>

            <div class="timeline" style="margin-top: 30px;">
                <h3><i class="fas fa-clock-rotate-left"></i> Investigation Timeline</h3>
                ${follow_ups.map(f => `
                    <div class="timeline-item">
                        <span class="timeline-date">${formatDate(f.event_date)}</span>
                        <p>${f.description}</p>
                    </div>
                `).join('')}
            </div>

            ${news.length > 0 ? `
            <div class="news" style="margin-top: 30px;">
                <h3><i class="fas fa-newspaper"></i> Verified News Coverage</h3>
                ${news.map(n => `
                    <div class="news-card">
                        <a href="${n.link}" target="_blank" class="news-title">${n.title}</a>
                        <p class="news-meta">${n.source} | ${new Date(n.pub_date).toLocaleDateString()}</p>
                    </div>
                `).join('')}
            </div>
            ` : ''}

            <div style="text-align: center; margin-top: 30px; border-top: 1px solid #eee; padding-top: 20px;">
                <a href="/api/firs/${fir.id}/pdf" class="pdf-btn">
                    <i class="fas fa-file-pdf"></i> Download Official FIR PDF (RTI Format)
                </a>
            </div>
        `;
        modal.classList.remove('hidden');
    }

    function formatDate(dateStr) {
        const options = { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' };
        return new Date(dateStr).toLocaleDateString('en-IN', options);
    }

    function getStatusClass(status) {
        if (status === 'Open') return 'status-open';
        if (status === 'Under Investigation') return 'status-investigation';
        return 'status-closed';
    }
});
