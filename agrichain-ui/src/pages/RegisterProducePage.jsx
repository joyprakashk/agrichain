import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const IMGBB_API_KEY = "61789d43e9480609db431f5ee47bc7b3"; // 🔑 Your ImgBB key

const RegisterProduce = () => {
  const navigate = useNavigate();

  const [produceName, setProduceName] = useState("");
  const [quantity, setQuantity] = useState("");
  const [harvestDate, setHarvestDate] = useState("");
  const [image, setImage] = useState(null);
  const [price, setPrice] = useState("");
  const [category, setCategory] = useState("");
  const [loading, setLoading] = useState(false);

  const handleImageChange = (e) => {
    setImage(e.target.files[0]);
  };

  // 🌿 Hybrid Image Upload (ImgBB + Local Fallback)
  const handleImageUpload = async () => {
    if (!image) return "";
    const formData = new FormData();
    formData.append("image", image);

    try {
      // Try ImgBB first
      const imgbbRes = await axios.post(
        `https://api.imgbb.com/1/upload?key=${IMGBB_API_KEY}`,
        formData
      );
      return imgbbRes.data.data.url; // ✅ Stored on ImgBB
    } catch (err) {
      console.warn("⚠️ ImgBB failed, using local upload:", err.message);
      // Fallback to local backend upload
      const localRes = await axios.post(
        "http://localhost:8080/api/upload",
        formData,
        { headers: { "Content-Type": "multipart/form-data" } }
      );
      return localRes.data.imageUrl; // ✅ Stored locally
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!produceName || !quantity || !harvestDate) {
      alert("Please fill all required fields");
      return;
    }

    setLoading(true);
    try {
      const email = localStorage.getItem("farmerEmail");
      if (!email) throw new Error("Farmer not logged in");

      // Upload Image
      let imageUrl = "";
      if (image) imageUrl = await handleImageUpload();

      // Save produce data to backend
      const res = await axios.post("http://localhost:8080/api/farmer/register-produce", {
        email,
        produceName,
        quantity,
        harvestDate,
        price,
        category,
        imageUrl,
      });

      if (res.status === 200) {
        // ✅ Redirect to success page with produce details
        const produceData = {
          produceName,
          quantity,
          harvestDate,
          price,
          category,
          imageUrl,
        };
        navigate("/register-success", { state: { produceData } });
      }
    } catch (error) {
      console.error("❌ Error registering produce:", error);
      alert("Failed to register produce. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-800 py-8">
      <div className="container max-w-2xl mx-auto px-4">
        <div className="bg-white dark:bg-gray-700 shadow-xl rounded-2xl p-8 border border-gray-100 dark:border-gray-600">
          <div className="text-center mb-8">
            <div className="w-16 h-16 mx-auto mb-4 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center">
              <span className="text-2xl">🌾</span>
            </div>
            <h2 className="text-3xl font-bold text-gray-800 dark:text-white mb-2">
              Register Produce
            </h2>
            <p className="text-gray-600 dark:text-gray-400">
              Add your fresh produce to the blockchain marketplace
            </p>
          </div>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block mb-2 font-semibold text-gray-700 dark:text-gray-300">
                Produce Name
              </label>
              <input
                type="text"
                value={produceName}
                onChange={(e) => setProduceName(e.target.value)}
                placeholder="e.g. Fresh Organic Tomatoes"
                className="border border-gray-300 dark:border-gray-600 rounded-lg w-full px-4 py-3 focus:ring-2 focus:ring-green-500 focus:border-green-500 dark:bg-gray-600 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 transition duration-150"
                required
              />
            </div>

            <div>
              <label className="block mb-2 font-semibold text-gray-700 dark:text-gray-300">
                Quantity (kg)
              </label>
              <input
                type="number"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                placeholder="e.g. 100"
                className="border border-gray-300 dark:border-gray-600 rounded-lg w-full px-4 py-3 focus:ring-2 focus:ring-green-500 focus:border-green-500 dark:bg-gray-600 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 transition duration-150"
                required
              />
            </div>

            <div>
              <label className="block mb-2 font-semibold text-gray-700 dark:text-gray-300">
                Harvest Date
              </label>
              <input
                type="date"
                value={harvestDate}
                onChange={(e) => setHarvestDate(e.target.value)}
                className="border border-gray-300 dark:border-gray-600 rounded-lg w-full px-4 py-3 focus:ring-2 focus:ring-green-500 focus:border-green-500 dark:bg-gray-600 dark:text-white transition duration-150"
                required
              />
            </div>

            <div>
              <label className="block mb-2 font-semibold text-gray-700 dark:text-gray-300">
                Price (₹ per kg)
              </label>
              <input
                type="number"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                placeholder="e.g. 50"
                className="border border-gray-300 dark:border-gray-600 rounded-lg w-full px-4 py-3 focus:ring-2 focus:ring-green-500 focus:border-green-500 dark:bg-gray-600 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 transition duration-150"
              />
            </div>

            <div>
              <label className="block mb-2 font-semibold text-gray-700 dark:text-gray-300">
                Category
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="border border-gray-300 dark:border-gray-600 rounded-lg w-full px-4 py-3 focus:ring-2 focus:ring-green-500 focus:border-green-500 dark:bg-gray-600 dark:text-white transition duration-150"
              >
                <option value="" className="text-gray-500">Select category</option>
                <option value="Vegetables">🥦 Vegetables</option>
                <option value="Fruits">🍎 Fruits</option>
                <option value="Grains">🌾 Grains</option>
                <option value="Organic Produce">🌱 Organic Produce</option>
              </select>
            </div>

            <div>
              <label className="block mb-2 font-semibold text-gray-700 dark:text-gray-300">
                Upload Image
              </label>
              <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-6 text-center hover:border-green-500 dark:hover:border-green-400 transition duration-150">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="hidden"
                  id="image-upload"
                />
                <label htmlFor="image-upload" className="cursor-pointer">
                  <div className="text-gray-400 dark:text-gray-500 mb-2">
                    <span className="text-4xl">📷</span>
                  </div>
                  <p className="text-gray-600 dark:text-gray-400 font-medium">
                    {image ? image.name : "Click to upload product image"}
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-500 mt-1">
                    PNG, JPG up to 10MB
                  </p>
                </label>
              </div>
            </div>

            <button
              type="submit"
              className="bg-green-600 hover:bg-green-700 dark:bg-green-700 dark:hover:bg-green-600 text-white font-semibold py-4 px-6 rounded-lg w-full shadow-lg hover:shadow-xl transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
              disabled={loading}
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                  Registering on Blockchain...
                </>
              ) : (
                <>
                  <span className="mr-2">🌾</span>
                  Register Produce
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default RegisterProduce;
