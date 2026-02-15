import { useState } from 'react';
import { useGetCallerFeedback, useSubmitFeedback } from '../hooks/useFeedback';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, MessageSquare, Send, CheckCircle2 } from 'lucide-react';
import { getUserFriendlyError } from '../utils/errors';
import { validateRequired, validateMinLength } from '../utils/validation';

export default function FeedbackPage() {
  const [message, setMessage] = useState('');
  const [validationError, setValidationError] = useState('');
  const [showSuccess, setShowSuccess] = useState(false);

  const { data: feedbackList, isLoading: isLoadingFeedback } = useGetCallerFeedback();
  const submitFeedback = useSubmitFeedback();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError('');
    setShowSuccess(false);

    // Client-side validation
    const messageValidation = validateRequired(message, 'Message');
    if (messageValidation) {
      setValidationError(messageValidation);
      return;
    }

    const lengthValidation = validateMinLength(message, 10, 'Message');
    if (lengthValidation) {
      setValidationError(lengthValidation);
      return;
    }

    try {
      await submitFeedback.mutateAsync({ message });
      setMessage('');
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 5000);
    } catch (error) {
      setValidationError(getUserFriendlyError(error));
    }
  };

  const formatDate = (timestamp: bigint) => {
    const date = new Date(Number(timestamp) / 1000000);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="container max-w-4xl py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight mb-2">Feedback & Suggestions</h1>
        <p className="text-muted-foreground">
          Help us improve Lost & Found by sharing your thoughts, reporting issues, or suggesting new features.
        </p>
      </div>

      <div className="grid gap-6">
        {/* Submit Feedback Form */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageSquare className="h-5 w-5" />
              Submit Feedback
            </CardTitle>
            <CardDescription>
              Share your experience, report a bug, or suggest a feature
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="message">Your Feedback *</Label>
                <Textarea
                  id="message"
                  placeholder="Tell us what's on your mind... (minimum 10 characters)"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  rows={6}
                  className="resize-none"
                  disabled={submitFeedback.isPending}
                />
                <p className="text-xs text-muted-foreground">
                  {message.length} characters
                </p>
              </div>

              {validationError && (
                <Alert variant="destructive">
                  <AlertDescription>{validationError}</AlertDescription>
                </Alert>
              )}

              {showSuccess && (
                <Alert className="border-success bg-success/10">
                  <CheckCircle2 className="h-4 w-4 text-success" />
                  <AlertDescription className="text-success">
                    Thank you! Your feedback has been submitted successfully.
                  </AlertDescription>
                </Alert>
              )}

              <Button
                type="submit"
                disabled={submitFeedback.isPending || !message.trim()}
                className="w-full sm:w-auto"
              >
                {submitFeedback.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  <>
                    <Send className="mr-2 h-4 w-4" />
                    Submit Feedback
                  </>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Previous Feedback */}
        <Card>
          <CardHeader>
            <CardTitle>Your Previous Feedback</CardTitle>
            <CardDescription>
              View all feedback you've submitted
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoadingFeedback ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              </div>
            ) : feedbackList && feedbackList.length > 0 ? (
              <div className="space-y-4">
                {feedbackList.map((feedback) => (
                  <div
                    key={feedback.id.toString()}
                    className="border rounded-lg p-4 space-y-2"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <p className="text-sm text-muted-foreground flex-shrink-0">
                        {formatDate(feedback.createdAt)}
                      </p>
                    </div>
                    <p className="text-sm whitespace-pre-wrap break-words">
                      {feedback.message}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <MessageSquare className="h-12 w-12 mx-auto mb-3 opacity-50" />
                <p className="text-sm">You haven't submitted any feedback yet.</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
