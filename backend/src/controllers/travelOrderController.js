import TravelOrder from '../models/travelOrderModel.js';

// Get all travel orders (admin/supervisor)
export const getAllTravelOrders = async (req, res) => {
  try {
    console.log('📝 Fetching all travel orders for admin/supervisor');
    const travels = await TravelOrder.find()
      .populate('userId', 'name avatar department position email')
      .sort({ startDate: -1 })
      .lean();
    console.log(`✅ Found ${travels.length} travel orders`);
    if (travels.length > 0) {
      console.log('📊 Sample travel order:', {
        _id: travels[0]._id,
        destination: travels[0].destination,
        hasDocument: !!travels[0].documentImage,
        documentSize: travels[0].documentImage ? travels[0].documentImage.length : 0,
        hasOCR: !!travels[0].ocrText
      });
    }
    res.json({ success: true, travels });
  } catch (err) {
    console.error('❌ Error fetching travel orders:', err.message);
    res.status(500).json({ success: false, message: err.message });
  }
};

// Get all travel orders for a user
export const getUserTravelOrders = async (req, res) => {
  try {
    const { userId } = req.params;
    const travels = await TravelOrder.find({ userId })
      .populate('userId', 'name avatar department position email')
      .sort({ startDate: -1 });
    res.json({ success: true, travels });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// Apply for a travel order
export const applyTravelOrder = async (req, res) => {
  try {
    console.log('📝 Creating new travel order');
    console.log('📦 Request body keys:', Object.keys(req.body));
    console.log('📦 Has documentImage:', !!req.body.documentImage);
    console.log('📦 Has ocrText:', !!req.body.ocrText);
    
    const travel = new TravelOrder(req.body);
    const saved = await travel.save();
    console.log('✅ Travel order created:', {
      id: saved._id,
      destination: saved.destination,
      hasDocumentImage: !!saved.documentImage,
      hasOcrText: !!saved.ocrText,
      status: saved.status
    });
    res.status(201).json({ success: true, travel: saved });
  } catch (err) {
    console.error('❌ Error applying travel order:', err.message);
    console.error('❌ Error details:', err.errors);
    res.status(400).json({ success: false, message: err.message });
  }
};

// Update travel order status
export const updateTravelOrderStatus = async (req, res) => {
  try {
    const { travelOrderId } = req.params;
    console.log('📝 Updating travel order status:', { travelOrderId, update: req.body });
    const updated = await TravelOrder.findByIdAndUpdate(travelOrderId, req.body, { new: true });
    console.log('✅ Travel order updated:', updated);
    res.json({ success: true, travel: updated });
  } catch (err) {
    console.error('❌ Error updating travel order status:', err.message);
    res.status(400).json({ success: false, message: err.message });
  }
};
