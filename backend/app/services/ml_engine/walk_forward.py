import numpy as np
import pandas as pd
from typing import Generator, Tuple, List

class PurgedWalkForwardCV:
    """
    Purged and Embargoed Walk-Forward Cross-Validation.
    Prevents look-ahead bias and information leakage in overlapping financial time series.
    
    Parameters:
    -----------
    n_splits: Number of walk-forward folds
    purge_window: Number of samples purged to eliminate label overlap (typically = forecast horizon)
    embargo_pct: Percentage of dataset length applied as an embargo buffer after test split
    min_train_size: Minimum number of samples required in the initial training fold
    """
    def __init__(
        self,
        n_splits: int = 4,
        purge_window: int = 5,
        embargo_pct: float = 0.02,
        min_train_size: int = 30
    ):
        self.n_splits = n_splits
        self.purge_window = purge_window
        self.embargo_pct = embargo_pct
        self.min_train_size = min_train_size

    def split(self, X: pd.DataFrame) -> Generator[Tuple[np.ndarray, np.ndarray], None, None]:
        n_samples = len(X)
        if n_samples < (self.min_train_size + self.n_splits * 5):
            # Fallback for short sample series
            split_point = int(n_samples * 0.75)
            train_idx = np.arange(0, max(5, split_point - self.purge_window))
            test_idx = np.arange(split_point, n_samples)
            yield train_idx, test_idx
            return

        embargo_size = max(1, int(n_samples * self.embargo_pct))
        test_size = (n_samples - self.min_train_size) // self.n_splits

        for i in range(self.n_splits):
            test_start = self.min_train_size + i * test_size
            test_end = min(n_samples, test_start + test_size) if i < self.n_splits - 1 else n_samples

            # Training set: all data up to test_start minus purge window
            train_end = max(5, test_start - self.purge_window)
            train_idx = np.arange(0, train_end)
            test_idx = np.arange(test_start, test_end)

            if len(train_idx) >= 10 and len(test_idx) > 0:
                yield train_idx, test_idx
