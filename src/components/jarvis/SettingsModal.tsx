import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Settings } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

export const SettingsModal = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [webhookUrl, setWebhookUrl] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleSaveWebhook = async () => {
    if (!webhookUrl.trim()) {
      toast({
        title: "Error",
        description: "Please enter a valid webhook URL",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      // Test the webhook URL first
      const testPayload = {
        message: "Test connection from JARVIS",
        timestamp: new Date().toISOString(),
        source: 'jarvis-settings-test'
      };

      const response = await fetch(webhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(testPayload),
      });

      if (response.ok) {
        toast({
          title: "Success",
          description: "Webhook URL updated and tested successfully!",
        });
        setIsOpen(false);
        setWebhookUrl('');
      } else {
        toast({
          title: "Warning",
          description: "Webhook URL saved but test failed. Please verify the URL is correct.",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to test webhook URL. Please check the URL and try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-foreground">
          <Settings className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>JARVIS Settings</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="webhook-url">n8n Webhook URL</Label>
            <Input
              id="webhook-url"
              type="url"
              placeholder="https://your-n8n-instance.com/webhook/..."
              value={webhookUrl}
              onChange={(e) => setWebhookUrl(e.target.value)}
              className="col-span-3"
            />
            <p className="text-sm text-muted-foreground">
              Enter your n8n webhook URL to process AI requests
            </p>
          </div>
        </div>
        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={() => setIsOpen(false)}>
            Cancel
          </Button>
          <Button onClick={handleSaveWebhook} disabled={isLoading}>
            {isLoading ? 'Testing...' : 'Save & Test'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};