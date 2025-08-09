import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { JarvisButton } from "./JarvisButton";
import { JarvisStatus } from "./JarvisStatus";
import { VoiceVisualizer } from "./VoiceVisualizer";
import { ConversationLog } from "./ConversationLog";
import { TextInput } from "./TextInput";
import { ConversationControls } from "./ConversationControls";
import { useJarvis } from "@/hooks/useJarvis";
import { Settings, Trash2, AlertCircle, Keyboard, Mic } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { SettingsModal } from "./SettingsModal";
import { useState } from "react";

export const JarvisInterface = () => {
  const { 
    status, 
    messages, 
    isSupported, 
    conversationMode,
    isConversationActive,
    handleMicrophoneClick, 
    handleTextMessage,
    clearConversation,
    toggleConversationMode,
    startConversation,
    stopConversation,
    interruptAI
  } = useJarvis();
  const [inputMode, setInputMode] = useState<'voice' | 'text'>(isSupported ? 'voice' : 'text');

  if (!isSupported) {
    return (
      <div className="min-h-screen p-6 flex flex-col items-center justify-center">
        {/* Header */}
        <div className="w-full max-w-4xl mb-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                JARVIS
              </h1>
              <p className="text-sm text-muted-foreground mt-1">
                Just A Rather Very Intelligent System
              </p>
            </div>
            
            <div className="flex items-center gap-2">
              <SettingsModal />
            </div>
          </div>
        </div>

        <Alert className="max-w-md mb-6">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Speech recognition is not supported in this browser. 
            Please use Chrome, Edge, or Safari for voice interaction.
            You can still chat with JARVIS using text input below.
          </AlertDescription>
        </Alert>

        {/* Text input fallback for unsupported browsers */}
        <div className="w-full max-w-md">
          <ConversationLog messages={messages} className="mb-4" />
          <TextInput
            onSend={handleTextMessage}
            isProcessing={status === 'processing'}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-6 flex flex-col items-center justify-center">
      {/* Header */}
      <div className="w-full max-w-4xl mb-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              JARVIS
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              Just A Rather Very Intelligent System
            </p>
          </div>
          
          <div className="flex items-center gap-2">
            <JarvisStatus status={status} />
            <Button 
              variant="ghost" 
              size="icon" 
              className="jarvis-surface"
              onClick={clearConversation}
              disabled={status === 'processing'}
            >
              <Trash2 className="w-4 h-4" />
            </Button>
            <SettingsModal />
          </div>
        </div>
      </div>

      {/* Main Interface */}
      <div className="w-full max-w-4xl flex gap-8">
        {/* Conversation Log */}
        <Card className="flex-1 jarvis-surface-elevated border-border/50">
          <ConversationLog messages={messages} />
        </Card>

      {/* Input Control Panel */}
        <div className="w-80 flex flex-col items-center gap-6">
          {/* Input Mode Toggle */}
          <Card className="w-full p-4 jarvis-surface border-border/50">
            <div className="flex bg-muted/20 rounded-lg p-1">
              <Button
                variant={inputMode === 'voice' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setInputMode('voice')}
                className="flex-1 flex items-center justify-center gap-2"
                disabled={!isSupported}
              >
                <Mic className="w-4 h-4" />
                Voice
              </Button>
              <Button
                variant={inputMode === 'text' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setInputMode('text')}
                className="flex-1 flex items-center justify-center gap-2"
              >
                <Keyboard className="w-4 h-4" />
                Text
              </Button>
            </div>
          </Card>

          {inputMode === 'voice' ? (
            <>
              {/* Conversation Controls */}
              <Card className="w-full p-4 jarvis-surface border-border/50">
                <ConversationControls
                  conversationMode={conversationMode}
                  isConversationActive={isConversationActive}
                  status={status}
                  onToggleMode={toggleConversationMode}
                  onStartConversation={startConversation}
                  onStopConversation={stopConversation}
                  onInterrupt={interruptAI}
                />
              </Card>

              {/* Voice Visualizer */}
              <Card className="w-full p-6 jarvis-surface-elevated border-border/50">
                <div className="text-center mb-4">
                  <h3 className="text-lg font-semibold mb-2">Voice Activity</h3>
                  <VoiceVisualizer 
                    isListening={status === 'listening'} 
                    isSpeaking={status === 'speaking'}
                    className="h-16 justify-center"
                  />
                </div>
              </Card>

              {/* Main Control Button */}
              <div className="flex flex-col items-center gap-4">
                {conversationMode === 'single' ? (
                  <JarvisButton
                    isListening={status === 'listening'}
                    isProcessing={status === 'processing' || status === 'speaking'}
                    onClick={handleMicrophoneClick}
                  />
                ) : (
                  <div className="text-center">
                    <p className="text-sm text-muted-foreground">
                      Use conversation controls above to manage continuous chat
                    </p>
                  </div>
                )}
                
                <div className="text-center">
                  <p className="text-sm text-muted-foreground">
                    {conversationMode === 'continuous' && isConversationActive && (
                      <>
                        {status === 'idle' && '🎤 Ready to listen...'}
                        {status === 'listening' && '👂 Listening to your voice...'}
                        {status === 'processing' && '🧠 Processing your request...'}
                        {status === 'speaking' && '🗣️ JARVIS is responding...'}
                      </>
                    )}
                    {conversationMode === 'single' && (
                      <>
                        {status === 'idle' && 'Click to start listening'}
                        {status === 'listening' && 'Listening to your voice...'}
                        {status === 'processing' && 'Processing your request...'}
                        {status === 'speaking' && 'JARVIS is responding...'}
                      </>
                    )}
                  </p>
                </div>
              </div>
            </>
          ) : (
            <Card className="w-full p-4 jarvis-surface border-border/50">
              <h3 className="text-lg font-semibold mb-4 text-center">Text Input</h3>
              <TextInput
                onSend={handleTextMessage}
                isProcessing={status === 'processing'}
              />
            </Card>
          )}

          {/* System Info */}
          <Card className="w-full p-4 jarvis-surface border-border/50">
            <div className="space-y-2 text-xs text-muted-foreground">
              <div className="flex justify-between">
                <span>Status:</span>
                <span className="capitalize text-foreground">{status}</span>
              </div>
              <div className="flex justify-between">
                <span>Messages:</span>
                <span className="text-foreground">{messages.length}</span>
              </div>
              <div className="flex justify-between">
                <span>Voice Support:</span>
                <span className={isSupported ? "text-green-400" : "text-orange-400"}>
                  {isSupported ? "Active" : "Unavailable"}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Input Mode:</span>
                <span className="text-foreground capitalize">{inputMode}</span>
              </div>
            </div>
          </Card>
        </div>
      </div>

      {/* Footer */}
      <div className="mt-8 text-center">
        <p className="text-xs text-muted-foreground">
          Powered by advanced AI • Secure voice processing
        </p>
      </div>
    </div>
  );
};