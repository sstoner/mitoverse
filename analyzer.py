"""
线粒体蛋白荧光强度分析核心模块
"""
import czifile
import numpy as np
from skimage import filters, measure, morphology
import os
import io
import base64
import matplotlib
matplotlib.use('Agg')  # 使用非GUI后端
import matplotlib.pyplot as plt
from typing import Optional, Dict, Tuple


class MitochondrialAnalyzer:
    """线粒体蛋白荧光强度分析器"""
    
    def __init__(self, threshold_method: str = 'otsu'):
        """
        初始化分析器
        
        Args:
            threshold_method: 阈值分割方法，可选 'otsu', 'li', 'yen'
        """
        self.threshold_method = threshold_method
    
    def analyze_czi_file(
        self, 
        file_path: str,
        mitochondrial_channel_index: int = 0,
        target_protein_channel_index: int = 2,
        generate_visualization: bool = False
    ) -> Optional[Dict]:
        """
        分析单个.czi文件
        
        Args:
            file_path: CZI文件路径
            mitochondrial_channel_index: 线粒体通道索引
            target_protein_channel_index: 目标蛋白通道索引
            generate_visualization: 是否生成可视化图像
            
        Returns:
            包含分析结果的字典，失败返回None
        """
        try:
            # 读取 CZI 文件
            image_data = czifile.imread(file_path)
            
            print(f"Processing {os.path.basename(file_path)}: Original image shape {image_data.shape}")
            
            # 提取通道数据
            mitochondrial_image, target_protein_image = self._extract_channels(
                image_data, 
                mitochondrial_channel_index, 
                target_protein_channel_index
            )
            
            if mitochondrial_image is None or target_protein_image is None:
                return None
            
            # 转换为 float 类型
            mitochondrial_image = mitochondrial_image.astype(np.float64)
            target_protein_image = target_protein_image.astype(np.float64)
            
            # 阈值分割
            thresh, mitochondrial_mask = self._threshold_image(mitochondrial_image)
            
            # 形态学操作
            mitochondrial_mask = self._morphological_operations(mitochondrial_mask)
            
            # 计算强度指标
            results = self._calculate_intensities(
                mitochondrial_image,
                target_protein_image,
                mitochondrial_mask,
                thresh
            )
            
            # 添加文件和通道信息
            results.update({
                'FileName': os.path.basename(file_path),
                'Mitochondrial_Channel_Index': mitochondrial_channel_index,
                'Target_Protein_Channel_Index': target_protein_channel_index,
                'Threshold_Method': self.threshold_method,
            })
            
            # 生成可视化图像
            if generate_visualization:
                visualization = self._generate_visualization(
                    mitochondrial_image,
                    target_protein_image,
                    mitochondrial_mask,
                    results,
                    mitochondrial_channel_index,
                    target_protein_channel_index
                )
                results['visualization'] = visualization
            
            return results
            
        except Exception as e:
            print(f"Error processing {file_path}: {e}")
            import traceback
            traceback.print_exc()
            return None
    
    def _extract_channels(
        self, 
        image_data: np.ndarray,
        mitochondrial_channel_index: int,
        target_protein_channel_index: int
    ) -> Tuple[Optional[np.ndarray], Optional[np.ndarray]]:
        """提取指定通道的图像数据"""
        original_shape = image_data.shape
        
        # 找到最大的两个维度作为Y和X
        shape_sorted_indices = sorted(
            range(len(original_shape)), 
            key=lambda i: original_shape[i], 
            reverse=True
        )
        
        y_dim_idx = shape_sorted_indices[0]
        x_dim_idx = shape_sorted_indices[1]
        
        # 找到通道维度
        channel_candidates = []
        for i, size in enumerate(original_shape):
            if size > 1 and i != y_dim_idx and i != x_dim_idx:
                channel_candidates.append((i, size))
        
        if not channel_candidates:
            print(f"Error: Could not find channel dimension in shape {original_shape}")
            return None, None
        
        channel_dim_idx, num_channels = channel_candidates[0]
        
        print(f"Detected: Channel dim at index {channel_dim_idx} with {num_channels} channels")
        
        # 检查通道索引是否有效
        if mitochondrial_channel_index >= num_channels or target_protein_channel_index >= num_channels:
            print(f"Error: Channel indices out of range")
            return None, None
        
        # 提取通道
        def extract_channel(channel_idx):
            slices = []
            for i, dim_size in enumerate(original_shape):
                if i == channel_dim_idx:
                    slices.append(channel_idx)
                elif i == y_dim_idx or i == x_dim_idx:
                    slices.append(slice(None))
                else:
                    slices.append(0)
            return image_data[tuple(slices)].squeeze()
        
        mitochondrial_image = extract_channel(mitochondrial_channel_index)
        target_protein_image = extract_channel(target_protein_channel_index)
        
        # 确保是2D图像
        if mitochondrial_image.ndim != 2 or target_protein_image.ndim != 2:
            print(f"Error: Images are not 2D after processing")
            return None, None
        
        return mitochondrial_image, target_protein_image
    
    def _threshold_image(self, image: np.ndarray) -> Tuple[float, np.ndarray]:
        """对图像进行阈值分割"""
        try:
            if self.threshold_method == 'otsu':
                thresh = filters.threshold_otsu(image)
            elif self.threshold_method == 'li':
                thresh = filters.threshold_li(image)
            elif self.threshold_method == 'yen':
                thresh = filters.threshold_yen(image)
            else:
                thresh = np.percentile(image, 75)
            
            print(f"Threshold value: {thresh}")
            
        except Exception as e:
            print(f"Error in thresholding: {e}")
            thresh = np.percentile(image, 75)
            print(f"Using 75th percentile threshold: {thresh}")
        
        mask = image > thresh
        return thresh, mask
    
    def _morphological_operations(self, mask: np.ndarray) -> np.ndarray:
        """形态学操作优化掩膜"""
        try:
            mask = morphology.remove_small_holes(mask, area_threshold=64)
            mask = morphology.binary_opening(mask, morphology.disk(3))
        except Exception as e:
            print(f"Warning: Morphological operations failed: {e}")
        
        return mask
    
    def _calculate_intensities(
        self,
        mitochondrial_image: np.ndarray,
        target_protein_image: np.ndarray,
        mitochondrial_mask: np.ndarray,
        thresh: float
    ) -> Dict:
        """计算荧光强度指标"""
        mask_area = np.sum(mitochondrial_mask)
        total_area = mitochondrial_mask.size
        mask_percentage = (mask_area / total_area) * 100
        
        print(f"Mitochondrial mask covers {mask_percentage:.2f}% of the image")
        
        if mask_area == 0:
            print(f"Warning: No mitochondrial signal found")
            return {
                'Average_Intensity_in_Mitochondria': 0,
                'Total_Intensity_in_Mitochondria': 0,
                'Mitochondrial_Pixels_Count': 0,
                'Mitochondrial_Average_Intensity': 0,
                'Threshold_Value': thresh,
                'Mask_Coverage_Percentage': 0
            }
        
        # 计算目标蛋白强度
        intensities_in_mask = target_protein_image[mitochondrial_mask]
        avg_intensity = np.mean(intensities_in_mask)
        total_intensity = np.sum(intensities_in_mask)
        num_pixels = len(intensities_in_mask)
        
        # 计算线粒体通道强度
        mitochondrial_avg_intensity = np.mean(mitochondrial_image[mitochondrial_mask])
        
        print(f"Results: avg_intensity={avg_intensity:.2f}, num_pixels={num_pixels}")
        
        return {
            'Average_Intensity_in_Mitochondria': float(avg_intensity),
            'Total_Intensity_in_Mitochondria': float(total_intensity),
            'Mitochondrial_Pixels_Count': int(num_pixels),
            'Mitochondrial_Average_Intensity': float(mitochondrial_avg_intensity),
            'Threshold_Value': float(thresh),
            'Mask_Coverage_Percentage': float(mask_percentage)
        }
    
    def _generate_visualization(
        self,
        mitochondrial_image: np.ndarray,
        target_protein_image: np.ndarray,
        mitochondrial_mask: np.ndarray,
        results: Dict,
        mitochondrial_channel_index: int,
        target_protein_channel_index: int
    ) -> str:
        """生成可视化图像并返回base64编码"""
        try:
            fig, axes = plt.subplots(2, 2, figsize=(12, 10))
            
            # 原始线粒体通道
            im1 = axes[0, 0].imshow(mitochondrial_image, cmap='gray')
            axes[0, 0].set_title(f'Mitochondrial Channel ({mitochondrial_channel_index})')
            axes[0, 0].axis('off')
            plt.colorbar(im1, ax=axes[0, 0], shrink=0.6)
            
            # 线粒体掩膜
            axes[0, 1].imshow(mitochondrial_mask, cmap='gray')
            axes[0, 1].set_title('Mitochondrial Mask')
            axes[0, 1].axis('off')
            
            # 原始目标蛋白通道
            im3 = axes[1, 0].imshow(target_protein_image, cmap='viridis')
            axes[1, 0].set_title(f'Target Protein Channel ({target_protein_channel_index})')
            axes[1, 0].axis('off')
            plt.colorbar(im3, ax=axes[1, 0], shrink=0.6)
            
            # 掩膜后的目标蛋白
            masked_target_protein = target_protein_image * mitochondrial_mask
            avg_intensity = results['Average_Intensity_in_Mitochondria']
            im4 = axes[1, 1].imshow(masked_target_protein, cmap='viridis')
            axes[1, 1].set_title(f'Target Protein in Mitochondria\n(Avg: {avg_intensity:.2f})')
            axes[1, 1].axis('off')
            plt.colorbar(im4, ax=axes[1, 1], shrink=0.6)
            
            plt.tight_layout()
            
            # 保存到内存并转为base64
            buf = io.BytesIO()
            plt.savefig(buf, format='png', dpi=150, bbox_inches='tight')
            buf.seek(0)
            img_base64 = base64.b64encode(buf.read()).decode('utf-8')
            plt.close(fig)
            
            return img_base64
            
        except Exception as e:
            print(f"Error generating visualization: {e}")
            return ""
