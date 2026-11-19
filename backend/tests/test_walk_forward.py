import pytest
import numpy as np
import pandas as pd
from app.services.ml_engine.walk_forward import PurgedWalkForwardCV

def test_purged_walk_forward_splits():
    # 60 days of historical data
    df = pd.DataFrame({
        "feature_1": np.random.randn(60),
        "feature_2": np.random.randn(60)
    })

    horizon = 5
    cv = PurgedWalkForwardCV(n_splits=3, purge_window=horizon, min_train_size=25)
    splits = list(cv.split(df))

    assert len(splits) > 0

    for train_idx, test_idx in splits:
        assert len(train_idx) >= 10
        assert len(test_idx) > 0
        
        # In purged walk-forward, max training index must strictly precede
        # test_start minus purge_window to prevent look-ahead leakage
        assert train_idx.max() <= (test_idx.min() - horizon)

        # No intersection between train and test
        assert len(set(train_idx).intersection(set(test_idx))) == 0
