import { useEffect, useState } from 'react';
import {
  Image,
  ImageProps,
  ImageSourcePropType,
  NativeSyntheticEvent,
  ImageErrorEventData,
} from 'react-native';

type RemoteImageWithFallbackProps = Omit<ImageProps, 'source'> & {
  uri?: string;
  fallbackSource: ImageSourcePropType;
};

export default function RemoteImageWithFallback({
  uri,
  fallbackSource,
  onError,
  ...imageProps
}: RemoteImageWithFallbackProps) {
  const [failedUri, setFailedUri] = useState<string | null>(null);

  useEffect(() => {
    setFailedUri(null);
  }, [uri]);

  const useFallback = !uri || failedUri === uri;
  const handleError = (event: NativeSyntheticEvent<ImageErrorEventData>) => {
    if (!useFallback && uri) setFailedUri(uri);
    onError?.(event);
  };

  return (
    <Image
      {...imageProps}
      source={useFallback ? fallbackSource : { uri }}
      onError={handleError}
    />
  );
}
