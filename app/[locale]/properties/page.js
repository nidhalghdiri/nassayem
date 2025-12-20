"use client";

import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import Layout from "../../../components/layout/Layout";
import { useTranslations } from "../../../lib/translations";

export default function PropertiesPage() {
  const pathname = usePathname();
  const [currentLocale, setCurrentLocale] = useState("en");
  const translate = useTranslations(currentLocale);
  const [editingProperty, setEditingProperty] = useState(null); // ← ADD THIS LINE

  useEffect(() => {
    // Get locale from URL
    const locale = pathname.split("/")[1] || "en";
    setCurrentLocale(locale);
  }, [pathname]);

  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [mounted, setMounted] = useState(false);

  // Wait for component to mount on client
  useEffect(() => {
    setMounted(true);
    fetchProperties();
  }, []);

  const fetchProperties = async () => {
    try {
      const response = await fetch("/api/properties");

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }

      const data = await response.json();

      // Ensure data is always an array
      setProperties(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Error fetching properties:", error);
      setProperties([]); // Set empty array on error
    } finally {
      setLoading(false);
    }
  };

  // Don't render UI until mounted
  if (!mounted) {
    return <div className="p-6">Loading...</div>;
  }

  // Create property
  const handleCreate = async (propertyData) => {
    try {
      console.log("Create Property Data: ", propertyData);
      const response = await fetch("/api/properties", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(propertyData),
      });

      if (response.ok) {
        fetchProperties(); // Refresh list
        return { success: true };
      } else {
        const error = await response.json();
        return { success: false, error: error.error };
      }
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  // Update property
  const handleUpdate = async (id, updates) => {
    try {
      const response = await fetch(`/api/properties/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updates),
      });

      if (response.ok) {
        fetchProperties(); // Refresh list
        setEditingProperty(null);
        return { success: true };
      } else {
        const error = await response.json();
        return { success: false, error: error.error };
      }
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  // Delete property
  const handleDelete = async (id) => {
    if (!confirm("Are you sure you want to delete this property?")) return;

    try {
      const response = await fetch(`/api/properties/${id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        fetchProperties(); // Refresh list
        alert("Property deleted successfully");
      }
    } catch (error) {
      console.error("Error deleting property:", error);
    }
  };

  return (
    <>
      <Layout
        headerStyle={1}
        footerStyle={1}
        breadcrumbTitle={translate("about", "introduction.title")}
        currentLocale={currentLocale}
      >
        <div className="container mx-auto p-6">
          <h1 className="text-3xl font-bold mb-8">
            Property Management Dashboard
          </h1>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Form Section */}
            <div className="lg:col-span-1">
              <div className="bg-white p-6 rounded-lg shadow-md">
                <h2 className="text-xl font-bold mb-4">
                  {editingProperty ? "Edit Property" : "Create New Property"}
                </h2>
                <PropertyForm
                  onSubmit={
                    editingProperty
                      ? (data) => handleUpdate(editingProperty.id, data)
                      : handleCreate
                  }
                  initialData={editingProperty || {}}
                  buttonText={
                    editingProperty ? "Update Property" : "Add Property"
                  }
                />
                {editingProperty && (
                  <button
                    onClick={() => setEditingProperty(null)}
                    className="mt-4 text-gray-600 hover:text-gray-800"
                  >
                    Cancel Edit
                  </button>
                )}
              </div>
            </div>

            {/* List Section */}
            <div className="lg:col-span-2">
              <div className="bg-white p-6 rounded-lg shadow-md">
                <h2 className="text-xl font-bold mb-4">
                  Properties ({properties.length})
                </h2>

                {loading ? (
                  <div className="text-center py-8">Loading properties...</div>
                ) : properties.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    No properties found. Create your first property!
                  </div>
                ) : (
                  <PropertyList
                    properties={properties}
                    onEdit={setEditingProperty}
                    onDelete={handleDelete}
                  />
                )}

                <div className="mt-6">
                  <button
                    onClick={fetchProperties}
                    className="px-4 py-2 bg-blue-100 text-blue-700 rounded hover:bg-blue-200"
                  >
                    Refresh List
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Layout>
    </>
  );
}

function PropertyForm({ onSubmit, initialData = {}, buttonText = "Submit" }) {
  const [formData, setFormData] = useState({
    title: initialData.title || "",
    description: initialData.description || "",
    price: initialData.price || "",
    location: initialData.location || "",
    bedrooms: initialData.bedrooms || "",
    bathrooms: initialData.bathrooms || "",
    area: initialData.area || "",
    amenities: initialData.amenities?.join(", ") || "",
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ type: "", text: "" });

    // Process amenities array
    const submissionData = {
      ...formData,
      price: parseFloat(formData.price) || 0,
      bedrooms: parseInt(formData.bedrooms) || 1,
      bathrooms: parseInt(formData.bathrooms) || 1,
      area: parseInt(formData.area) || 0,
      amenities: formData.amenities
        .split(",")
        .map((item) => item.trim())
        .filter((item) => item),
    };

    const result = await onSubmit(submissionData);

    if (result.success) {
      setMessage({ type: "success", text: "Operation successful!" });
      if (!initialData.id) {
        // Reset form if creating new
        setFormData({
          title: "",
          description: "",
          price: "",
          location: "",
          bedrooms: "",
          bathrooms: "",
          area: "",
          amenities: "",
        });
      }
    } else {
      setMessage({ type: "error", text: result.error || "An error occurred" });
    }

    setLoading(false);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium mb-1">Title</label>
        <input
          type="text"
          name="title"
          value={formData.title}
          onChange={handleChange}
          className="w-full p-2 border rounded"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Description</label>
        <textarea
          name="description"
          value={formData.description}
          onChange={handleChange}
          className="w-full p-2 border rounded"
          rows="3"
          required
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-1">Price ($)</label>
          <input
            type="number"
            min="0"
            step="0.01"
            name="price"
            value={formData.price}
            onChange={handleChange}
            className="w-full p-2 border rounded"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Location</label>
          <input
            type="text"
            name="location"
            value={formData.location}
            onChange={handleChange}
            className="w-full p-2 border rounded"
            required
          />
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-medium mb-1">Bedrooms</label>
          <input
            type="number"
            min="0"
            name="bedrooms"
            value={formData.bedrooms}
            onChange={handleChange}
            className="w-full p-2 border rounded"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Bathrooms</label>
          <input
            type="number"
            min="0"
            name="bathrooms"
            value={formData.bathrooms}
            onChange={handleChange}
            className="w-full p-2 border rounded"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Area (m²)</label>
          <input
            type="number"
            min="0"
            name="area"
            value={formData.area}
            onChange={handleChange}
            className="w-full p-2 border rounded"
            required
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">
          Amenities (comma separated)
        </label>
        <input
          type="text"
          name="amenities"
          value={formData.amenities}
          onChange={handleChange}
          className="w-full p-2 border rounded"
          placeholder="WiFi, Pool, Parking, etc."
        />
      </div>

      {message.text && (
        <div
          className={`p-3 rounded ${
            message.type === "success"
              ? "bg-green-100 text-green-700"
              : "bg-red-100 text-red-700"
          }`}
        >
          {message.text}
        </div>
      )}

      <button
        type="submit"
        disabled={loading}
        className={`w-full py-2 px-4 rounded font-medium ${
          loading ? "bg-gray-400" : "bg-blue-600 hover:bg-blue-700 text-white"
        }`}
      >
        {loading ? "Processing..." : buttonText}
      </button>
    </form>
  );
}

function PropertyList({ properties, onEdit, onDelete }) {
  return (
    <div className="space-y-4">
      {properties.map((property) => (
        <div
          key={property.id}
          className="border rounded-lg p-4 hover:bg-gray-50"
        >
          <div className="flex justify-between items-start">
            <div>
              <h3 className="font-bold text-lg">{property.title}</h3>
              <p className="text-gray-600">{property.location}</p>
              <div className="flex gap-4 mt-2 text-sm">
                <span>${property.price}/night</span>
                <span className="flex items-center">
                  <span className="mr-1" role="img" aria-label="beds">
                    🛏️
                  </span>
                  {property.bedrooms} beds
                </span>
                <span className="flex items-center">
                  <span className="mr-1" role="img" aria-label="baths">
                    🛁
                  </span>
                  {property.bathrooms} baths
                </span>
                <span className="flex items-center">
                  <span className="mr-1" role="img" aria-label="area">
                    📏
                  </span>
                  {property.area}m²
                </span>
                <span
                  className={`px-2 py-1 rounded ${
                    property.status === "AVAILABLE"
                      ? "bg-green-100 text-green-800"
                      : "bg-red-100 text-red-800"
                  }`}
                >
                  {property.status}
                </span>
              </div>
              {property.amenities && property.amenities.length > 0 && (
                <p className="mt-2 text-sm text-gray-500">
                  Amenities: {property.amenities.join(", ")}
                </p>
              )}
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => onEdit(property)}
                className="px-3 py-1 bg-yellow-100 text-yellow-700 rounded hover:bg-yellow-200"
              >
                Edit
              </button>
              <button
                onClick={() => onDelete(property.id)}
                className="px-3 py-1 bg-red-100 text-red-700 rounded hover:bg-red-200"
              >
                Delete
              </button>
            </div>
          </div>

          <p className="mt-2 text-gray-700">{property.description}</p>
          <div className="mt-2 text-xs text-gray-400">
            {/* FIXED: Use useEffect to format dates on client only */}
            <PropertyDate property={property} />
          </div>
        </div>
      ))}
    </div>
  );
}

// NEW: Separate component for client-side date formatting
function PropertyDate({ property }) {
  const [formattedDate, setFormattedDate] = useState("");

  useEffect(() => {
    // This only runs on the client
    if (property.createdAt) {
      setFormattedDate(new Date(property.createdAt).toLocaleDateString());
    }
  }, [property.createdAt]);

  return (
    <>
      Created: {formattedDate || "Loading date..."} | By:{" "}
      {property.user?.name || "Unknown"}
    </>
  );
}
