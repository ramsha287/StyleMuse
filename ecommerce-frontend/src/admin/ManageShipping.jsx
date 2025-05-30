import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

const API_URL = process.env.REACT_APP_API_URL;

const ManageShipping = () => {
  const initialForm = {
    name: '',
    description: '',
    baseCost: '',
    estimatedDaysMin: '',
    estimatedDaysMax: '',
    isActive: true,
    weightLimit: '',
    dimensionsLength: '',
    dimensionsWidth: '',
    dimensionsHeight: '',
    handlingFee: '',
    freeShippingThreshold: '',
    regions: [{ country: '', states: '' }],
    priceRules: [{ minWeight: '', maxWeight: '', price: '' }],
  };

  const [shippingMethods, setShippingMethods] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [refresh, setRefresh] = useState(false);
  const [form, setForm] = useState(initialForm);
  const [editId, setEditId] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const fetchShipping = async () => {
      const token = localStorage.getItem('token');
      try {
        const res = await axios.get(`${API_URL}/api/shipping/methods`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setShippingMethods(res.data.data?.shippingMethods || []);
        setLoading(false);
      } catch (err) {
        setError('Failed to fetch shipping methods');
        setLoading(false);
      }
    };
    fetchShipping();
  }, [refresh]);

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this shipping method?')) return;
    const token = localStorage.getItem('token');
    try {
      await axios.delete(`${API_URL}/api/shipping/methods/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setRefresh(r => !r);
    } catch {
      alert('Failed to delete shipping method');
    }
  };

  // Handle input changes for simple fields
  const handleChange = e => {
    const { name, value, type, checked } = e.target;
    setForm(f => ({
      ...f,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  // Handle regions and priceRules changes
  const handleRegionChange = (idx, field, value) => {
    setForm(f => {
      const regions = [...f.regions];
      regions[idx][field] = value;
      return { ...f, regions };
    });
  };
  const handleRegionStatesChange = (idx, value) => {
    setForm(f => {
      const regions = [...f.regions];
      regions[idx].states = value;
      return { ...f, regions };
    });
  };
  const handlePriceRuleChange = (idx, field, value) => {
    setForm(f => {
      const priceRules = [...f.priceRules];
      priceRules[idx][field] = value;
      return { ...f, priceRules };
    });
  };

  // Add/remove region/priceRule
  const addRegion = () => setForm(f => ({ ...f, regions: [...f.regions, { country: '', states: '' }] }));
  const removeRegion = idx => setForm(f => ({ ...f, regions: f.regions.filter((_, i) => i !== idx) }));
  const addPriceRule = () => setForm(f => ({ ...f, priceRules: [...f.priceRules, { minWeight: '', maxWeight: '', price: '' }] }));
  const removePriceRule = idx => setForm(f => ({ ...f, priceRules: f.priceRules.filter((_, i) => i !== idx) }));

  // Build payload for submit
  const buildPayload = () => ({
    name: form.name,
    description: form.description,
    baseCost: form.baseCost !== '' ? Number(form.baseCost) : 0,
    estimatedDays: {
      min: form.estimatedDaysMin !== '' ? Number(form.estimatedDaysMin) : 0,
      max: form.estimatedDaysMax !== '' ? Number(form.estimatedDaysMax) : 0,
    },
    isActive: !!form.isActive,
    weightLimit: form.weightLimit !== '' ? Number(form.weightLimit) : 0,
    dimensions: {
      length: form.dimensionsLength !== '' ? Number(form.dimensionsLength) : 0,
      width: form.dimensionsWidth !== '' ? Number(form.dimensionsWidth) : 0,
      height: form.dimensionsHeight !== '' ? Number(form.dimensionsHeight) : 0,
    },
    handlingFee: form.handlingFee !== '' ? Number(form.handlingFee) : 0,
    freeShippingThreshold: form.freeShippingThreshold !== '' ? Number(form.freeShippingThreshold) : 0,
    regions: form.regions.map(r => ({
      country: r.country,
      states: r.states.split(',').map(s => s.trim()).filter(Boolean),
    })),
    priceRules: form.priceRules.map(pr => ({
      minWeight: pr.minWeight !== '' ? Number(pr.minWeight) : 0,
      maxWeight: pr.maxWeight !== '' ? Number(pr.maxWeight) : 0,
      price: pr.price !== '' ? Number(pr.price) : 0,
    })),
  });

  const handleSubmit = async e => {
    e.preventDefault();
    if (submitting) return;
    setSubmitting(true);
    const token = localStorage.getItem('token');
    const payload = buildPayload();
    try {
      if (editId) {
        await axios.patch(`${API_URL}/api/shipping/methods/${editId}`, payload, {
          headers: { Authorization: `Bearer ${token}` },
        });
      } else {
        await axios.post(`${API_URL}/api/shipping/methods`, payload, {
          headers: { Authorization: `Bearer ${token}` },
        });
      }
      setForm(initialForm);
      setEditId(null);
      setRefresh(r => !r);
    } catch (err) {
      alert(err?.response?.data?.message || 'Failed to save shipping method');
    }
    setSubmitting(false);
  };

  const handleEdit = method => {
    setEditId(method._id);
    setForm({
      name: method.name || '',
      description: method.description || '',
      baseCost: method.baseCost !== undefined ? String(method.baseCost) : '',
      estimatedDaysMin: method.estimatedDays?.min !== undefined ? String(method.estimatedDays.min) : '',
      estimatedDaysMax: method.estimatedDays?.max !== undefined ? String(method.estimatedDays.max) : '',
      isActive: !!method.isActive,
      weightLimit: method.weightLimit !== undefined ? String(method.weightLimit) : '',
      dimensionsLength: method.dimensions?.length !== undefined ? String(method.dimensions.length) : '',
      dimensionsWidth: method.dimensions?.width !== undefined ? String(method.dimensions.width) : '',
      dimensionsHeight: method.dimensions?.height !== undefined ? String(method.dimensions.height) : '',
      handlingFee: method.handlingFee !== undefined ? String(method.handlingFee) : '',
      freeShippingThreshold: method.freeShippingThreshold !== undefined ? String(method.freeShippingThreshold) : '',
      regions: (method.regions || [{ country: '', states: '' }]).map(r => ({
        country: r.country || '',
        states: Array.isArray(r.states) ? r.states.join(', ') : (r.states || ''),
      })),
      priceRules: method.priceRules || [{ minWeight: '', maxWeight: '', price: '' }],
    });
  };

  const handleCancelEdit = () => {
    setEditId(null);
    setForm(initialForm);
  };

  console.log(shippingMethods.map(m => ({ name: m.name, isActive: m.isActive, type: typeof m.isActive })));
  
  return (
    <div className="min-h-screen bg-parchment flex flex-col">
      <Navbar />
      <main className="flex-1 max-w-4xl mx-auto py-10 px-4">
        <h1 className="text-3xl font-bold mb-8 text-stone text-center">Manage Shipping Methods</h1>
        {loading ? (
          <div className="text-center text-taupe">Loading...</div>
        ) : error ? (
          <div className="text-center text-red-500">{error}</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full bg-white rounded-xl shadow border border-beige">
              <thead>
                <tr className="bg-beige text-stone">
                  <th className="py-2 px-4 text-stone">Name</th>
                  <th className="py-2 px-4 text-stone">Description</th>
                  <th className="py-2 px-4 text-stone">Base Cost</th>
                  <th className="py-2 px-4 text-stone">Estimated Days</th>
                  <th className="py-2 px-4 text-stone">Active</th>
                  <th className="py-2 px-4 text-stone">Actions</th>
                </tr>
              </thead>
              <tbody>
                {shippingMethods.map(method => (
                  <tr
                    key={method._id}
                    className="border-b last:border-none border-beige hover:bg-parchment/60 transition"
                  >
                    <td className="py-2 px-4 text-stone">{method.name}</td>
                    <td className="py-2 px-4 text-taupe">{method.description}</td>
                    <td className="py-2 px-4 text-taupe font-semibold">₹{method.baseCost}</td>
                    <td className="py-2 px-4">
                      <span className="bg-linen px-2 py-1 rounded text-stone">
                        {method.estimatedDays?.min} - {method.estimatedDays?.max} days
                      </span>
                    </td>
                    <td className="py-2 px-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-bold ${!!method.isActive ? 'bg-[#b9b4a8] text-white' : 'bg-gray-300 text-stone'}`}>
                        {!!method.isActive ? 'Yes' : 'No'}
                      </span>
                    </td>
                    <td className="py-2 px-4">
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleEdit(method)}
                          className="bg-[#b9b4a8] text-white px-4 py-2 rounded hover:bg-[#a29e92] transition"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(method._id)}
                          className="bg-[#b9b4a8] text-white px-4 py-2 rounded hover:bg-[#a29e92] transition"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow p-8 mt-8 max-w-2xl mx-auto border border-beige">
          <h2 className="text-2xl font-bold mb-6 text-stone">{editId ? 'Edit' : 'Add'} Shipping Method</h2>
          
          {/* General Info */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-stone mb-2">General Info</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input
                name="name"
                value={form.name}
                onChange={handleChange}
                placeholder="Name"
                className="border border-beige p-2 rounded bg-parchment text-stone placeholder:text-beige"
                required
              />
              <input
                name="baseCost"
                value={form.baseCost}
                onChange={handleChange}
                placeholder="Base Cost"
                type="number"
                min="0"
                className="border border-beige p-2 rounded bg-parchment text-stone placeholder:text-beige"
                required
              />
              <input
                name="estimatedDaysMin"
                value={form.estimatedDaysMin}
                onChange={handleChange}
                placeholder="Min Days"
                type="number"
                min="1"
                className="border border-beige p-2 rounded bg-parchment text-stone placeholder:text-beige"
                required
              />
              <input
                name="estimatedDaysMax"
                value={form.estimatedDaysMax}
                onChange={handleChange}
                placeholder="Max Days"
                type="number"
                min="1"
                className="border border-beige p-2 rounded bg-parchment text-stone placeholder:text-beige"
                required
              />
              <input
                name="weightLimit"
                value={form.weightLimit}
                onChange={handleChange}
                placeholder="Weight Limit"
                type="number"
                className="border border-beige p-2 rounded bg-parchment text-stone placeholder:text-beige"
              />
              <input
                name="handlingFee"
                value={form.handlingFee}
                onChange={handleChange}
                placeholder="Handling Fee"
                type="number"
                className="border border-beige p-2 rounded bg-parchment text-stone placeholder:text-beige"
              />
              <input
                name="freeShippingThreshold"
                value={form.freeShippingThreshold}
                onChange={handleChange}
                placeholder="Free Shipping Threshold"
                type="number"
                className="border border-beige p-2 rounded bg-parchment text-stone placeholder:text-beige"
              />
            </div>
            <textarea
              name="description"
              value={form.description}
              onChange={handleChange}
              placeholder="Description"
              className="border border-beige p-2 rounded bg-parchment w-full mt-4 text-stone placeholder:text-beige"
              rows={2}
              required
            />
            <div className="flex items-center mt-4">
              <input
                type="checkbox"
                name="isActive"
                checked={form.isActive}
                onChange={handleChange}
                className="mr-2 accent-[#b9b4a8]"
              />
              <label className="text-stone">Active</label>
            </div>
          </div>

          {/* Dimensions */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-stone mb-2">Dimensions (cm)</h3>
            <div className="grid grid-cols-3 gap-4">
              <input
                name="dimensionsLength"
                value={form.dimensionsLength}
                onChange={handleChange}
                placeholder="Length"
                type="number"
                className="border border-beige p-2 rounded bg-parchment text-stone placeholder:text-beige"
              />
              <input
                name="dimensionsWidth"
                value={form.dimensionsWidth}
                onChange={handleChange}
                placeholder="Width"
                type="number"
                className="border border-beige p-2 rounded bg-parchment text-stone placeholder:text-beige"
              />
              <input
                name="dimensionsHeight"
                value={form.dimensionsHeight}
                onChange={handleChange}
                placeholder="Height"
                type="number"
                className="border border-beige p-2 rounded bg-parchment text-stone placeholder:text-beige"
              />
            </div>
          </div>

          {/* Regions */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-stone mb-2">Regions</h3>
            {form.regions.map((region, idx) => (
              <div key={idx} className="flex gap-2 mb-2">
                <input
                  value={region.country}
                  onChange={e => handleRegionChange(idx, 'country', e.target.value)}
                  placeholder="Country"
                  className="border border-beige p-2 rounded bg-parchment text-stone placeholder:text-beige"
                />
                <input
                  value={region.states}
                  onChange={e => handleRegionStatesChange(idx, e.target.value)}
                  placeholder="States (comma separated)"
                  className="border border-beige p-2 rounded bg-parchment text-stone placeholder:text-beige"
                />
                <button type="button" onClick={() => removeRegion(idx)} className="text-stone">
                  Remove
                </button>
              </div>
            ))}
            <button type="button" onClick={addRegion} className="text-[#b9b4a8] mt-1">
              Add Region
            </button>
          </div>

          {/* Price Rules */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-stone mb-2">Price Rules</h3>
            {form.priceRules.map((pr, idx) => (
              <div
                key={idx}
                className="flex flex-wrap gap-2 mb-2"
              >
                <input
                  value={pr.minWeight}
                  onChange={e => handlePriceRuleChange(idx, 'minWeight', e.target.value)}
                  placeholder="Min Weight"
                  type="number"
                  className="border border-beige p-2 rounded bg-parchment text-stone placeholder:text-beige min-w-[110px] flex-1"
                />
                <input
                  value={pr.maxWeight}
                  onChange={e => handlePriceRuleChange(idx, 'maxWeight', e.target.value)}
                  placeholder="Max Weight"
                  type="number"
                  className="border border-beige p-2 rounded bg-parchment text-stone placeholder:text-beige min-w-[110px] flex-1"
                />
                <input
                  value={pr.price}
                  onChange={e => handlePriceRuleChange(idx, 'price', e.target.value)}
                  placeholder="Price"
                  type="number"
                  className="border border-beige p-2 rounded bg-parchment text-stone placeholder:text-beige min-w-[110px] flex-1"
                />
                <button
                  type="button"
                  onClick={() => removePriceRule(idx)}
                  className="text-stone"
                >
                  Remove
                </button>
              </div>
            ))}
            <button type="button" onClick={addPriceRule} className="text-[#b9b4a8] mt-1">
              Add Price Rule
            </button>
          </div>

          <div className="mt-6 flex gap-3">
            <button
              type="submit"
              disabled={submitting}
              className="bg-[#b9b4a8] text-white px-6 py-2 rounded hover:bg-[#a29e92] transition font-semibold"
            >
              {editId ? 'Update' : 'Add'}
            </button>
            {editId && (
              <button
                type="button"
                onClick={handleCancelEdit}
                className="bg-gray-300 text-stone px-6 py-2 rounded hover:bg-gray-400 transition font-semibold"
              >
                Cancel
              </button>
            )}
          </div>
        </form>
      </main>
      <Footer />
    </div>
  );
};

export default ManageShipping;