import czifile
import numpy as np
from skimage import filters, measure, morphology
import pandas as pd
import os

def analyze_czi_file(file_path, mitochondrial_channel_index, target_protein_channel_index, output_folder, threshold_method='otsu'):
    """
    分析单个.czi文件，根据线粒体通道筛选并评估目标蛋白通道的荧光强度。

    参数:
        file_path (str): .czi文件的完整路径。
        mitochondrial_channel_index (int): 线粒体通道的索引（从0开始）。
        target_protein_channel_index (int): 目标蛋白通道的索引（从0开始）。
        output_folder (str): 结果图片保存的文件夹路径。
        threshold_method (str): 阈值分割方法，可选 'otsu', 'li', 'yen' 等。

    返回:
        dict: 包含文件名、线粒体区域平均强度、线粒体区域总强度等分析结果。
              如果处理失败，返回None。
    """
    try:
        # 读取 CZI 文件
        image_data = czifile.imread(file_path)
        
        print(f"Processing {os.path.basename(file_path)}: Original image shape {image_data.shape}")
        
        # 处理复杂的维度结构
        # 对于形状像 (1, 1, 4, 1, 1, 3136, 3136, 1) 的数据
        # 我们需要找到有意义的维度：通道数、Y、X
        original_shape = image_data.shape
        
        # 移除所有大小为1的维度，但保留有意义的维度
        # 首先找到最大的两个维度（应该是Y和X）
        shape_sorted_indices = sorted(range(len(original_shape)), key=lambda i: original_shape[i], reverse=True)
        
        # 找到最大的两个维度作为Y和X
        y_dim_idx = shape_sorted_indices[0]  # 最大维度
        x_dim_idx = shape_sorted_indices[1]  # 第二大维度
        
        # 找到可能的通道维度（大小>1且不是Y或X）
        channel_candidates = []
        for i, size in enumerate(original_shape):
            if size > 1 and i != y_dim_idx and i != x_dim_idx:
                channel_candidates.append((i, size))
        
        if not channel_candidates:
            print(f"Error: Could not find channel dimension in shape {original_shape}")
            return None
        
        # 选择第一个找到的通道维度
        channel_dim_idx, num_channels = channel_candidates[0]
        
        print(f"Detected: Channel dim at index {channel_dim_idx} with {num_channels} channels")
        print(f"Detected: Y dim at index {y_dim_idx} with size {original_shape[y_dim_idx]}")
        print(f"Detected: X dim at index {x_dim_idx} with size {original_shape[x_dim_idx]}")
        
        # 检查通道索引是否有效
        if mitochondrial_channel_index >= num_channels or target_protein_channel_index >= num_channels:
            print(f"Error: Channel indices out of range. File has {num_channels} channels, "
                  f"but requested mitochondrial channel {mitochondrial_channel_index} "
                  f"and target protein channel {target_protein_channel_index}")
            return None
        
        # 创建切片来提取数据
        def extract_channel(channel_idx):
            # 创建一个用于切片的索引列表
            slices = []
            for i, dim_size in enumerate(original_shape):
                if i == channel_dim_idx:
                    slices.append(channel_idx)
                elif i == y_dim_idx or i == x_dim_idx:
                    slices.append(slice(None))  # 保留整个维度
                else:
                    slices.append(0)  # 对于其他维度，取第一个索引
            
            return image_data[tuple(slices)]
        
        # 提取指定通道的图像
        mitochondrial_image = extract_channel(mitochondrial_channel_index)
        target_protein_image = extract_channel(target_protein_channel_index)
        
        # 确保图像是2D的
        mitochondrial_image = mitochondrial_image.squeeze()
        target_protein_image = target_protein_image.squeeze()
        
        print(f"Final image shapes after extraction:")
        print(f"  Mitochondrial: {mitochondrial_image.shape}")
        print(f"  Target protein: {target_protein_image.shape}")
        
        # 确保都是2D图像
        if mitochondrial_image.ndim != 2 or target_protein_image.ndim != 2:
            print(f"Error: Images are not 2D after processing")
            print(f"  Mitochondrial dims: {mitochondrial_image.ndim}")
            print(f"  Target protein dims: {target_protein_image.ndim}")
            return None

        print(f"Image data types and ranges:")
        print(f"  Mitochondrial: dtype={mitochondrial_image.dtype}, range={mitochondrial_image.min()}-{mitochondrial_image.max()}")
        print(f"  Target protein: dtype={target_protein_image.dtype}, range={target_protein_image.min()}-{target_protein_image.max()}")

        # 确保图像是数值类型并且不是空的
        if mitochondrial_image.size == 0 or target_protein_image.size == 0:
            print(f"Error: Empty images extracted from {os.path.basename(file_path)}")
            return None

        # 转换为 float 类型以避免整数溢出
        mitochondrial_image = mitochondrial_image.astype(np.float64)
        target_protein_image = target_protein_image.astype(np.float64)

        # 阈值分割线粒体通道
        try:
            if threshold_method == 'otsu':
                thresh = filters.threshold_otsu(mitochondrial_image)
            elif threshold_method == 'li':
                thresh = filters.threshold_li(mitochondrial_image)
            elif threshold_method == 'yen':
                thresh = filters.threshold_yen(mitochondrial_image)
            else:
                raise ValueError(f"Unknown threshold method: {threshold_method}")
            
            print(f"Threshold value: {thresh}")
            
        except Exception as e:
            print(f"Error in thresholding: {e}")
            # 如果自动阈值失败，使用图像的75%值作为阈值
            thresh = np.percentile(mitochondrial_image, 75)
            print(f"Using 75th percentile threshold: {thresh}")

        mitochondrial_mask = mitochondrial_image > thresh

        # 检查掩膜是否有效
        mask_area = np.sum(mitochondrial_mask)
        total_area = mitochondrial_mask.size
        mask_percentage = (mask_area / total_area) * 100
        
        print(f"Mitochondrial mask covers {mask_percentage:.2f}% of the image ({mask_area}/{total_area} pixels)")
        
        if mask_area == 0:
            print(f"Warning: No mitochondrial signal found after thresholding in {os.path.basename(file_path)}")
            avg_intensity = 0
            total_intensity = 0
            num_pixels = 0
        else:
            # 形态学操作（可选，用于优化掩膜）
            # 例如，移除小孔洞，平滑边缘
            try:
                mitochondrial_mask = morphology.remove_small_holes(mitochondrial_mask, area_threshold=64)
                mitochondrial_mask = morphology.binary_opening(mitochondrial_mask, morphology.disk(3)) # 开运算
            except Exception as e:
                print(f"Warning: Morphological operations failed: {e}")

            # 计算掩膜区域内的荧光强度
            # 确保只计算掩膜区域（True值）内的像素
            intensities_in_mask = target_protein_image[mitochondrial_mask]

            if len(intensities_in_mask) == 0:
                print(f"No pixels in mitochondrial mask after morphological operations")
                avg_intensity = 0
                total_intensity = 0
                num_pixels = 0
            else:
                avg_intensity = np.mean(intensities_in_mask)
                total_intensity = np.sum(intensities_in_mask)
                num_pixels = len(intensities_in_mask)
                
                print(f"Final results: avg_intensity={avg_intensity:.2f}, "
                      f"total_intensity={total_intensity:.2f}, num_pixels={num_pixels}")

        # 保存结果图片（可选，用于可视化检查）
        try:
            import matplotlib.pyplot as plt

            # 创建输出文件夹
            if not os.path.exists(output_folder):
                os.makedirs(output_folder)

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
            im4 = axes[1, 1].imshow(masked_target_protein, cmap='viridis')
            axes[1, 1].set_title(f'Target Protein in Mitochondria\n(Avg: {avg_intensity:.2f})')
            axes[1, 1].axis('off')
            plt.colorbar(im4, ax=axes[1, 1], shrink=0.6)

            plt.tight_layout()
            output_image_path = os.path.join(output_folder, os.path.basename(file_path).replace('.czi', '_analysis.png'))
            plt.savefig(output_image_path, dpi=150, bbox_inches='tight')
            plt.close(fig)
            print(f"Saved analysis image to: {output_image_path}")
            
        except ImportError:
            print("Matplotlib not installed. Skipping image saving.")
        except Exception as e:
            print(f"Error saving image for {os.path.basename(file_path)}: {e}")

        # 计算线粒体通道本身的平均强度
        mitochondrial_avg_intensity = np.mean(mitochondrial_image[mitochondrial_mask]) if mask_area > 0 else 0

        return {
            'FileName': os.path.basename(file_path),
            'Mitochondrial_Channel_Index': mitochondrial_channel_index,
            'Target_Protein_Channel_Index': target_protein_channel_index,
            'Average_Intensity_in_Mitochondria': avg_intensity,
            'Total_Intensity_in_Mitochondria': total_intensity,
            'Mitochondrial_Pixels_Count': num_pixels,
            'Mitochondrial_Average_Intensity': mitochondrial_avg_intensity,
            'Threshold_Method': threshold_method,
            'Threshold_Value': thresh if 'thresh' in locals() else 0,
            'Mask_Coverage_Percentage': mask_percentage if 'mask_percentage' in locals() else 0
        }

    except Exception as e:
        print(f"Error processing {file_path}: {e}")
        import traceback
        traceback.print_exc()
        return None

def batch_analyze_czi_files(folder_path, mitochondrial_channel_index, target_protein_channel_index, output_csv_path, output_image_folder, threshold_method='otsu'):
    """
    批量分析指定文件夹下的所有.czi文件。

    参数:
        folder_path (str): 包含.czi文件的文件夹路径。
        mitochondrial_channel_index (int): 线粒体通道的索引（从0开始）。
        target_protein_channel_index (int): 目标蛋白通道的索引（从0开始）。
        output_csv_path (str): 结果CSV文件保存路径。
        output_image_folder (str): 结果图片保存的文件夹路径。
        threshold_method (str): 阈值分割方法。
    """
    results = []
    
    # 确保输出文件夹存在
    if not os.path.exists(output_image_folder):
        os.makedirs(output_image_folder)
        
    # 确保输出CSV的文件夹存在
    csv_dir = os.path.dirname(output_csv_path)
    if csv_dir and not os.path.exists(csv_dir):
        os.makedirs(csv_dir)
    
    czi_files = [f for f in os.listdir(folder_path) if f.endswith('.czi')]
    print(f"Found {len(czi_files)} CZI files to process")
    
    for filename in czi_files:
        file_path = os.path.join(folder_path, filename)
        print(f"\n{'='*50}")
        print(f"Starting analysis for {filename}...")
        print(f"{'='*50}")
        
        result = analyze_czi_file(file_path, mitochondrial_channel_index, target_protein_channel_index, output_image_folder, threshold_method)
        if result:
            results.append(result)
            print(f"✓ Successfully analyzed {filename}")
        else:
            print(f"✗ Failed to analyze {filename}")
        
        print(f"Finished analysis for {filename}")

    if results:
        df = pd.DataFrame(results)
        df.to_csv(output_csv_path, index=False)
        print(f"\n{'='*50}")
        print(f"Analysis complete! Results saved to {output_csv_path}")
        print(f"Processed {len(results)} out of {len(czi_files)} files successfully")
        print(f"Analysis images saved to {output_image_folder}")
        print(f"{'='*50}")
        
        # 显示结果汇总
        print("\nResults Summary:")
        print(df[['FileName', 'Average_Intensity_in_Mitochondria', 'Mitochondrial_Average_Intensity', 'Mitochondrial_Pixels_Count', 'Mask_Coverage_Percentage']].to_string(index=False))
        
        return df
    else:
        print("No CZI files processed successfully or no results generated.")
        return None


# %%
# 请根据你的实际情况修改这些路径和参数
input_czi_folder = "./data/czi" # 存放CZI文件的文件夹
output_results_csv = "./results/czi/analysis_results.csv" # 结果CSV文件
output_analysis_images_folder = "./results/czi/analysis_images" # 存放分析图片的文件夹

# 假设你的线粒体通道是第一个（索引为0），目标蛋白通道是第二个（索引为1）
# 请根据你的实际染料和CZI文件中的通道顺序调整
mitochondrial_channel = 0
target_protein_channel = 2

# 阈值分割方法，可以尝试 'otsu', 'li', 'yen' 等
# 'otsu' 通常是一个很好的起点
thresholding_method = 'otsu'

# 运行批量分析
results_df = batch_analyze_czi_files(
    input_czi_folder,
    mitochondrial_channel,
    target_protein_channel,
    output_results_csv,
    output_analysis_images_folder,
    thresholding_method
)

# %%
# 加载并显示分析结果
import pandas as pd
import matplotlib.pyplot as plt

# 读取结果文件
results_df = pd.read_csv("./results/czi/analysis_results.csv")
print("CZI 文件分析结果:")
print("=" * 60)
print(results_df.to_string(index=False))

print(f"\n总结:")
print(f"- 成功分析了 {len(results_df)} 个CZI文件")
print(f"- 线粒体通道索引: {results_df['Mitochondrial_Channel_Index'].iloc[0]}")
print(f"- 目标蛋白通道索引: {results_df['Target_Protein_Channel_Index'].iloc[0]}")
print(f"- 阈值方法: {results_df['Threshold_Method'].iloc[0]}")

# 比较分析
print(f"\n线粒体区域内目标蛋白荧光强度对比:")
for _, row in results_df.iterrows():
    print(f"  {row['FileName']}: {row['Average_Intensity_in_Mitochondria']:.2f} (平均), {row['Total_Intensity_in_Mitochondria']:.0f} (总和)")

# 创建对比图表
fig, (ax1, ax2, ax3) = plt.subplots(1, 3, figsize=(15, 5))

# 平均荧光强度对比
ax1.bar(range(len(results_df)), results_df['Average_Intensity_in_Mitochondria'])
ax1.set_xlabel('Files')
ax1.set_ylabel('Average Fluorescence Intensity')
ax1.set_title('Average Fluorescence Intensity in Mitochondria')
ax1.set_xticks(range(len(results_df)))
ax1.set_xticklabels([name.replace('.czi', '').replace('u87 03 ', '') for name in results_df['FileName']], rotation=45)

# 线粒体覆盖率对比
ax2.bar(range(len(results_df)), results_df['Mask_Coverage_Percentage'])
ax2.set_xlabel('Files')
ax2.set_ylabel('Coverage (%)')
ax2.set_title('Mitochondrial Mask Coverage')
ax2.set_xticks(range(len(results_df)))
ax2.set_xticklabels([name.replace('.czi', '').replace('u87 03 ', '') for name in results_df['FileName']], rotation=45)

# 总荧光强度对比
ax3.bar(range(len(results_df)), results_df['Total_Intensity_in_Mitochondria'])
ax3.set_xlabel('Files')
ax3.set_ylabel('Total Fluorescence Intensity')
ax3.set_title('Total Fluorescence Intensity in Mitochondria')
ax3.set_xticks(range(len(results_df)))
ax3.set_xticklabels([name.replace('.czi', '').replace('u87 03 ', '') for name in results_df['FileName']], rotation=45)

plt.tight_layout()
plt.savefig('./results/czi/comparison_plot.png', dpi=150, bbox_inches='tight')
plt.show()

print(f"\n对比图表已保存到: ./results/czi/comparison_plot.png")
print(f"分析图片保存在: ./results/czi/analysis_images/")

# %% [markdown]
# ## 🎉 分析完成！
# 
# ### 分析结果概览
# 
# ✅ **成功完成了CZI文件的线粒体蛋白荧光强度分析**
# 
# **主要发现:**
# - **scr-1样本**: 平均荧光强度 42.78，线粒体覆盖率 7.86%
# - **sg-1样本**: 平均荧光强度 209.21，线粒体覆盖率 5.96%
# 
# **sg-1样本显示出明显更高的目标蛋白荧光强度 (约4.9倍)**
# 
# ### 生成的文件
# 
# 1. **分析结果CSV**: `./results/czi/analysis_results.csv`
# 2. **可视化分析图片**: `./results/czi/analysis_images/`
#    - 每个CZI文件对应一个PNG图片，显示原始通道、掩膜和分析结果
# 3. **对比图表**: `./results/czi/comparison_plot.png`
# 
# ### 如何自定义分析参数
# 
# 如果需要调整分析参数，可以修改下面的代码:

# %%
# 自定义分析参数示例
# 如果需要重新分析或分析其他文件，可以修改以下参数：

# 1. 文件路径配置
custom_input_folder = "./data/czi"                              # CZI文件所在文件夹
custom_output_csv = "./results/czi/custom_analysis.csv"         # 自定义输出CSV路径
custom_output_images = "./results/czi/custom_images"            # 自定义输出图片路径

# 2. 通道配置 (重要！根据你的实验设计调整)
custom_mitochondrial_channel = 0    # 线粒体染料通道 (如MitoTracker)
custom_target_protein_channel = 1   # 目标蛋白通道 (如GFP, RFP等)

# 3. 阈值方法选择
custom_threshold_method = 'otsu'     # 可选: 'otsu', 'li', 'yen'

print("参数配置完成，准备运行自定义分析...")
print(f"输入文件夹: {custom_input_folder}")
print(f"线粒体通道: {custom_mitochondrial_channel}")  
print(f"目标蛋白通道: {custom_target_protein_channel}")
print(f"阈值方法: {custom_threshold_method}")

# 取消注释下面的代码来运行自定义分析:
# custom_results = batch_analyze_czi_files(
#     custom_input_folder,
#     custom_mitochondrial_channel,
#     custom_target_protein_channel,
#     custom_output_csv,
#     custom_output_images,
#     custom_threshold_method
# )

# %%


# %%
# 重新运行分析以生成包含线粒体通道平均强度的CSV文件
print("重新运行分析以添加线粒体通道平均强度...")

# 运行批量分析（包含新的线粒体平均强度列）
updated_results_df = batch_analyze_czi_files(
    input_czi_folder,
    mitochondrial_channel,
    target_protein_channel,
    output_results_csv,
    output_analysis_images_folder,
    thresholding_method
)

# %%
# 显示更新后的结果
print("更新后的分析结果（包含线粒体通道平均强度）:")
print("=" * 80)

# 重新读取更新后的CSV文件
updated_results_df = pd.read_csv("./results/czi/analysis_results.csv")

# 显示所有列名
print("CSV文件包含的列:")
for i, col in enumerate(updated_results_df.columns):
    print(f"  {i+1}. {col}")

print(f"\n数据预览 (前5行):")
display_cols = ['FileName', 'Average_Intensity_in_Mitochondria', 'Mitochondrial_Average_Intensity', 'Mask_Coverage_Percentage']
print(updated_results_df[display_cols].head().to_string(index=False))

print(f"\n✅ 成功添加了 'Mitochondrial_Average_Intensity' 列！")
print(f"这一列显示的是线粒体通道（Channel {updated_results_df['Mitochondrial_Channel_Index'].iloc[0]}）在掩膜区域内的平均强度")

# 显示一些统计信息
print(f"\n统计摘要:")
print(f"- 目标蛋白平均强度范围: {updated_results_df['Average_Intensity_in_Mitochondria'].min():.2f} - {updated_results_df['Average_Intensity_in_Mitochondria'].max():.2f}")
print(f"- 线粒体通道平均强度范围: {updated_results_df['Mitochondrial_Average_Intensity'].min():.2f} - {updated_results_df['Mitochondrial_Average_Intensity'].max():.2f}")


