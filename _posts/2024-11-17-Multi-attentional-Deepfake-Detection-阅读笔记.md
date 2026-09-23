---
title: "Multi-attentional Deepfake Detection 阅读笔记"
date: 2024-11-17 23:59:56
description: "终于力扣的每日一题打卡完成了，以后应该只会偶尔写题解了，力扣的大概率应该不会再写了，以后还是专心读论文。定个小目标，每次在看完一篇论文之后不管看懂没看懂看得多不多都写一篇阅读笔记。"
tags: [LeetCode, 机器学习, 数学, 数据结构]
category: "论文阅读"
---

# Multi-attentional Deepfake Detection 阅读笔记

终于力扣的每日一题打卡完成了，以后应该只会偶尔写题解了，力扣的大概率应该不会再写了，以后还是专心读论文。定个小目标，每次在看完一篇论文之后不管看懂没看懂看得多不多都写一篇阅读笔记。

不过目前这一篇说是阅读笔记，估计论文翻译的比重更大一点吧，实在不太能看懂。

这篇应该是2021年发布在CVPR上的一篇关于深度伪造检测的论文。简单来说这篇论文提出了一种“新”的对深度伪造视频的检测方法。论文提出“现在”大多数深度伪造检测的方法是将其视为一种简单的二元分类问题，基本步骤就是先利用骨干网络\(backbone network\)提取出图像的全局特征，然后把它喂给二元分类器\(binary classifier\)就可以得到一个真或假的结果。

但由于真假图像往往只在某些局部地区有微小差异，作者认为这并不是一个很好的方法。作者在论文中选择将其视为一种细粒度的的分类问题\(fine\-grained classification\),提出了一种新的多注意力\(multi\-attentional\)深度伪造检测网络。

这个模型主要由三个部分构成，1）使用注意力模块生成多个空间注意力头，用来关注图像的不同的局部地区。2）使用稠密连接的卷积层作为纹理特征增强块\(textural feature enhancement block\)，用来提取并放大浅层特征中的细微伪影\(subtle artifacts\)。3）使用BAP\(Bilinear Attention Pooling\)替换全局平均池化层\(global average pooling\)聚合低级的纹理特征并保留高级的语义特征。

但这种设计还存在一点小问题。不像单注意的网络可以利用视频级标签分类进行监督学习，多注意网络缺少细粒度级的标签，所以只能使用无监督学习或者弱监督学习，但这也导致网络容易因为多个注意力都集中在一个区域从而退化为单注意力网络。所以作者提出了区域独立的损失\(regional independence loss\)减少每个注意力图关注的区域的重叠并且对不同的输入保持关注的语义区域的一致性。 ~~感觉自己只是在翻译摘要~~ 

**Introduction** 

在鸟类的细粒度分类问题中，有些物种看上去十分相似，只有很微小的区别，如喙的形状或颜色不同。受此启发，作者认为可以将深度伪造检测视为一种只有两个分类的细粒度分类问题。

> First, in order to make the network attend to different potential artifacts regions, we design multi\-attention heads to predict multiple spatial attention maps by using the deep semantic features\. Second, to prevent the subtle difference from disappearing in the deep layers, we enhance the textural feature obtained from shallow layers and then aggregate both low\-level texture features and high\-level semantic features as the representation for each local part\. Finally, the feature representations of each local part will be independently pooled by a bilinear attention pooling layer and fused as the representation for the whole image\.

受到基于局部的模型在细粒度分类领域的成功的启发，作者提出了多注意力网络。首先，为了让网络可以关注不同的潜在伪造区域，作者设计了多个注意力头，利用深层语义特征预测多个空间注意力图\(multiple spatial attention maps\)。其次，为了防止出现在深层网络的细微差异，作者增强了从浅层获得了纹理特征，并将低级的纹理特征与高级的语义特征结合起来作为每个局部部分的代表。最后，每个局部区域的特征代表将会被独立的由一个双线性注意力池层汇聚并融合成整个图像的代表。

 <img src="/assets/posts/88_1.png" alt="" style="max-height:817px; box-sizing:content-box;" />

**2\.Related Works** 

**2\.1\. Deepfake Detection** 

介绍了几种现有的检测方法，但都是基于二元分类的，专注于如何构造复杂的特征提取器。

**2\.2\. Fine\-grained Classification** 

介绍了细粒度分类。该领域主要关注定位差异区域，并以弱监督的方式学习不同局部特征。

> Studies in this field mainly focus on locating the discriminative regions and learning a diverse collection of complementary parts in weaklysupervised manners\.

**3\. Methods** 

**3\.1\. Overview** 

由于不同区域间的纹理特征变化很大，使用global average pooling可能会将不同区域的特征进行平均从而导致差异的减小，所以作者使用local attention pooling代替global average pooling。

另一方面，作者发现伪造造成的slight artifacts倾向于停留在浅层特征，所以应该更关注并增强浅层的特征。这里的纹理信息指的是浅层特征中的高频分量\(the high frequency com ponent\)。

受到这些发现的启发，作者提出了多注意力框架，将深度伪造检测作为细粒度分类问题。

这个模型主要由三个部分构成，1）使用注意力模块生成多个空间注意力头，用来关注图像的不同的局部地区。2）使用稠密连接的卷积层作为纹理特征增强块\(textural feature enhancement block\)，用来提取并放大浅层特征中的细微伪影\(subtle artifacts\)。3）使用BAP\(Bilinear Attention Pooling\)替换全局平均池化层\(global average pooling\)聚合低级的纹理特征并保留高级的语义特征。

 <img src="/assets/posts/88_2.png" alt="" style="max-height:620px; box-sizing:content-box;" />

由于多注意网络缺少细粒度级的标签，所以只能使用无监督学习或者弱监督学习，但这也导致网络容易因为多个注意力都集中在一个区域从而退化为单注意力网络。所以作者提出了区域独立的损失\(regional independence loss\)减少每个注意力图关注的区域的重叠并且对不同的输入保持关注的语义区域的一致性。

另外，作者使用了一种注意力引导的数据增强机制\(the At tention Guided Data Augementation\(AGDA\)\)，通过降低最显著特征的突出性使其他注意力图挖掘更多有效的信息。

**3\.2\. Multi\-attentional Framework** 

记输入的图像为I，框架的骨干网络为f，第t层提取的特征图为ft\(I\)，特征图大小为Ct\*Ht\*Wt，Ct为通道数，Ht和Wt为特征图的高度和宽度。

 <img src="/assets/posts/88_3.png" alt="" style="max-height:495px; box-sizing:content-box;" />

**Multiple Attention Maps Generation\.** 对于给定的输入图I，框架会先使用一个注意力块为I生成多个注意力图。注意力块包含一个1\*1的卷积层，一个批量归一化层和一个非线性激活层ReLU。从特定层SLa提取出来的特征图会被放到放到这个注意力块中生成M个大小为Ht\*Wt的注意力图A，每个注意力图表示一个辨别区域。

Textural Feature Enhancement\.对从特定层SLt得到的特征图使用局部平均池化进行下采样，得到池化后的特征图D。然后，类似于空间图片的特征表示，在特征级别定义残差表示纹理信息：TSLt = fSLt \(I\) \-D。这里的T包含了SLt的大部分纹理信息。然后使用一个三层的稠密连接卷积块增强T，输出结果记为F，也就是“纹理特征图”

Bilinear Attention Pooling\.在得到了注意力图A和纹理特征图F之后，使用Bilinear Attention Pooling \(BAP\)得到特征图。为了提取浅层特征，使用双线性插值\(bilinear interpolation\)调整注意力图大小到与特征图一致。然后，对每个注意力图Ak，使用纹理特征图F进行逐元素相乘，得到部分纹理特征图Fk。

本来在最后，部分纹理特征图 Fk​ 应该在经过全局池化后被送入分类器进行分类。然而，考虑到不同区域范围的差异，如果使用传统的全局平均池化，池化后的特征向量会受到注意力图强度的影响，这违背了与专注于纹理信息的目的。所以作者设计了归一化平均池化。 <img src="/assets/posts/88_4.png" alt="" style="max-height:126px; box-sizing:content-box;" />

被归一化后的注意力特征vk会被堆叠起来作为纹理特征矩阵P送入分类器。

而对于深层特征，作者先拼接每个注意力图为一个单通道注意力图Asum，然后使用BAP对Asum和从网络最后一层得到的注意力图进行处理得到全局深层特征G，同样送入分类器。

3\.3\. Regional Independence Loss for Attention Maps Regularization

为了减少注意力图之间的重叠，提出了Regional Independence Loss。对池化后的特征图D使用BAP得到语义特征向量V。Regional Independence Loss定义为

 <img src="/assets/posts/88_5.png" alt="" style="max-height:222px; box-sizing:content-box;" />

其中B为批量大小，M是注意力个数，min表示特征与关联特征中心的边界距离，根据yi取0和1的不同设置为不同值，mout表示每个特征中心的距离，c是V的特征中心，定义为

 <img src="/assets/posts/88_6.png" alt="" style="max-height:123px; box-sizing:content-box;" />

其中，α 是特征中心的更新率，每个训练轮次后衰减。

区域独立损失由两个部分组成：

1. **类内损失（intra\-class loss）** ：将特征 V 拉近到特征中心 c，减少类内的分散性；

2. **类间损失（inter\-class loss）** ：将特征中心互相推开，使其在空间中更加分散。

我们通过计算每批次中 V 的梯度来优化 c。考虑到伪造人脸的纹理模式比真实人脸更为多样，因为伪造人脸是通过多种方法生成的，因此我们对伪造人脸的部分特征施加更大的边界距离，以便从真实人脸的特征中心中搜索更多有用信息。

对于我们框架的目标函数，我们将区域独立损失与传统的交叉熵损失相结合：

 <img src="/assets/posts/88_7.png" alt="" style="max-height:73px; box-sizing:content-box;" />

其中， $$
\pounds_{CE}
$$是交叉熵损失，λ1​ 和 λ2 是这两个损失项的平衡权重。在我们的实验中，默认设置 λ1=λ2=1。

3\.4\. Attention Guided Data Augmentations

虽然使用了Regional Independence Loss有效的减少了不同注意力区域的重叠，但他们可能还是会对同一个特征产生反应，所以又提出了注意力引到的数据增强机制。\(the Attention Guided Data Augmentation \(AGDA\) mechanism\)

对每一个训练样本，随机选择一个注意力图A用于引导数据增强的过程。先将其归一化成增强图Ak\*，然后使用高斯模糊生成退化的图像，最后使用Ak\*作为原始图像和退化图像的权重\(weight\)

 <img src="/assets/posts/88_8.png" alt="" style="max-height:60px; box-sizing:content-box;" />

**AGDA** 在两个方面有助于模型训练：1\. 在某些区域添加模糊处理，确保模型可以从其他区域学习到更具有robust的特征。2\. AGDA会随机删除一些特别明显的区域，迫使不同的注意力图关注不同的目标。

而且AGDA还可以防止单一注意力图过度扩张，鼓励注意力块探索不同的区域划分方式。

**4\. Experiments** 

4\.1\. Implement Details

输入图像大小为380\*280，超参数 $$
\alpha=0.05
$$，并每轮递减0\.9， $$
m_{out}=0.2
$$， $$
m_{in}
$$对于real和fake图像分别设置为0\.05和0\.1。

在ADGA中，resize factor设置为0\.3， $$

$$高斯模糊 $$
\sigma
$$设置为7。使用Adma进行训练，学习率为0\.001，权重衰减为1e\-6

4\.2\. Determination of $$
SL_a
$$and $$
SL_t
$$

模型使用EfficientNet\-b4作为骨干网络， $$
L_2
$$和 $$
L_3
$$作为 $$
SL_t
$$的候选， $$
L_4
$$和 $$
L_5
$$作为 $$
SL_a
$$的候选。选择 $$
L_2
$$和 $$
L_5
$$的效果最好

 <img src="/assets/posts/88_9.png" alt="" style="max-height:385px; box-sizing:content-box;" />

**4\.3\.ComparisonwithPreviousMethods** 

这个模型对高压缩率较为敏感，因为这种压缩会模糊空间域中的大部分有用信息。

**4\.4\.AblationStudy** 

M=4时表现最佳。

**5\.Conclusion** 

前面内容与摘要差不多，最后结论就是效果挺好。Our method achieves good improvements in extensive metrics\.