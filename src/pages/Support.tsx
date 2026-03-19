import { Mail, Phone, MessageCircle, Clock } from "lucide-react";

const Support = () => {
  return (
    <div className="container mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold mb-8">Customer Support</h1>
      
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {/* Email Support */}
        <div className="bg-card rounded-lg p-6 border shadow-sm">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-primary/10 rounded-lg">
              <Mail className="h-6 w-6 text-primary" />
            </div>
            <h2 className="text-xl font-semibold">Email Support</h2>
          </div>
          <p className="text-muted-foreground mb-4">
            Send us an email and we'll respond within 24 hours.
          </p>
          <a 
            href="mailto:support@lpgtracker.com" 
            className="text-primary hover:underline"
          >
            support@lpgtracker.com
          </a>
        </div>

        {/* Phone Support */}
        <div className="bg-card rounded-lg p-6 border shadow-sm">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-primary/10 rounded-lg">
              <Phone className="h-6 w-6 text-primary" />
            </div>
            <h2 className="text-xl font-semibold">Phone Support</h2>
          </div>
          <p className="text-muted-foreground mb-4">
            Available Monday to Friday, 9 AM to 6 PM.
          </p>
          <a 
            href="tel:+1234567890" 
            className="text-primary hover:underline"
          >
            +1 (234) 567-890
          </a>
        </div>

        {/* Live Chat */}
        <div className="bg-card rounded-lg p-6 border shadow-sm">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-primary/10 rounded-lg">
              <MessageCircle className="h-6 w-6 text-primary" />
            </div>
            <h2 className="text-xl font-semibold">Live Chat</h2>
          </div>
          <p className="text-muted-foreground mb-4">
            Chat with our support team in real-time.
          </p>
          <button className="text-primary hover:underline">
            Start Chat
          </button>
        </div>
      </div>

      {/* Business Hours */}
      <div className="mt-8 bg-muted rounded-lg p-6">
        <div className="flex items-center gap-3 mb-4">
          <Clock className="h-6 w-6" />
          <h2 className="text-xl font-semibold">Business Hours</h2>
        </div>
        <ul className="space-y2">
          <li>Monday - Friday: 9:00 AM - 6:00 PM</li>
          <li>Saturday: 10:00 AM - 2:00 PM</li>
          <li>Sunday: Closed</li>
        </ul>
      </div>

      {/* FAQ Section */}
      <div className="mt-8">
        <h2 className="text-2xl font-bold mb-4">Frequently Asked Questions</h2>
        <div className="space-y-4">
          <div className="bg-card rounded-lg p-6 border">
            <h3 className="font-semibold mb-2">How do I track my cylinder delivery?</h3>
            <p className="text-muted-foreground">
              Use the "Track Order" feature in your dashboard to see real-time delivery status.
            </p>
          </div>
          <div className="bg-card rounded-lg p-6 border">
            <h3 className="font-semibold mb-2">How do I book a new cylinder?</h3>
            <p className="text-muted-foreground">
              Navigate to "Book Cylinder" from your dashboard and fill in the required details.
            </p>
          </div>
          <div className="bg-card rounded-lg p-6 border">
            <h3 className="font-semibold mb-2">What if my cylinder is damaged?</h3>
            <p className="text-muted-foreground">
              Contact our support team immediately and we'll arrange a replacement.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Support;

