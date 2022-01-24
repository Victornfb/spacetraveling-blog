import { getPrismicClient } from "../../services/prismic";
import { Document } from '@prismicio/client/types/documents';

export default async (req, res) => {
    function linkResolver(doc: Document): string {
        if (doc.type === 'publication') {
            return `/post/${doc.uid}`;
        }
        return '/';
    }

  const { token: ref, documentId } = req.query;
  const redirectUrl = await getPrismicClient(req)
    .getPreviewResolver(ref, documentId)
    .resolve(linkResolver, '/');

  if (!redirectUrl) {
    return res.status(401).json({ message: 'Invalid token' });
  }

  res.setPreviewData({ ref });

  res.write(
    `<!DOCTYPE html><html><head><meta http-equiv="Refresh" content="0; url=${redirectUrl}" />
    <script>window.location.href = '${redirectUrl}'</script>
    </head>`
  );
  res.end();
};