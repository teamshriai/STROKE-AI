"""Model definition for serving.

Trimmed from the training pipeline to only what inference needs: the
multiple-instance-learning model that takes a bag of NCCT slices and produces
one study-level prediction. Attribute names (`backbone`, `pool`, `head`) must
stay as-is — the trained checkpoint's state-dict keys depend on them.
"""
from __future__ import annotations

import torch
import torch.nn as nn
from torchvision.models import efficientnet_b0

EMBED_DIM = 1280


def _efficientnet_b0_backbone() -> nn.Module:
    # Weights come from the trained checkpoint, so no ImageNet download here.
    net = efficientnet_b0(weights=None)
    net.classifier = nn.Identity()
    return net


class GatedAttentionPool(nn.Module):
    """Gated attention pooling over an MIL bag of slices (Ilse et al. 2018)."""

    def __init__(self, embed_dim: int, hidden: int = 128):
        super().__init__()
        self.V = nn.Linear(embed_dim, hidden)
        self.U = nn.Linear(embed_dim, hidden)
        self.w = nn.Linear(hidden, 1)

    def forward(self, x: torch.Tensor):
        a = torch.tanh(self.V(x)) * torch.sigmoid(self.U(x))
        weights = torch.softmax(self.w(a), dim=1)
        pooled = (weights * x).sum(dim=1)
        return pooled, weights.squeeze(-1)


class CQ500MILModel(nn.Module):
    """A study is a bag of slices: shared encoder + attention pooling -> logits.

    The attention weights are returned alongside the logits so the UI can show
    which slices drove the prediction.
    """

    def __init__(self, num_outputs: int = 8):
        super().__init__()
        self.backbone = _efficientnet_b0_backbone()
        self.pool = GatedAttentionPool(EMBED_DIM)
        self.head = nn.Linear(EMBED_DIM, num_outputs)

    def forward(self, slices: torch.Tensor):
        # slices: [B, N, 3, H, W]
        b, n = slices.shape[:2]
        flat = slices.reshape(b * n, *slices.shape[2:])
        embeds = self.backbone(flat).reshape(b, n, -1)
        pooled, attn = self.pool(embeds)
        return self.head(pooled), attn
