---
title: "c++ 读取MNIST数据集实现softmax回归"
date: 2024-11-18 20:26:33
description: "3.4. softmax回归 — 动手学深度学习 2.0.0 documentation"
tags: [机器学习]
category: "论文阅读"
---

# c++ 读取MNIST数据集实现softmax回归

[pytorch教材](https://zh-v2.d2l.ai/chapter_linear-networks/softmax-regression.html) 

[3\.4\. softmax回归 — 动手学深度学习 2\.0\.0 documentation](https://zh-v2.d2l.ai/chapter_linear-networks/softmax-regression.html) 

c\+\+实现代码

代码太长了就没整理了，也暂时没有运行效果截图

同样没有本文也没有实现反向自动求导

超长代码警告，757行。不过可能注释占一半

```cpp
#include <bits/stdc++.h>
using namespace std;
// reverseInt 函数：将32位整数的大小端进行转换  
// 参数：  
// x: 需要进行大小端转换的32位整数  
// 返回值：  
// 转换后（即小端转大端或大端转小端）的32位整数 
int reverseInt(int x)
{
	// 定义四个无符号字符变量，用于存储整数x的四个字节  
	unsigned char a, b, c, d;
	// 获取整数x的最低8位（即第一个字节） 
	// (int)255的二进制是00000000 00000000 00000000 11111111，与操作后只保留最低8位  
	a = x & 255;
	// 获取整数x的第二个字节（即第9-16位）
	b = (x>>8) & 255;
	// 获取整数x的第三个字节（即第17-24位）
	c = (x>>16) & 255;
	// 获取整数x的最高字节（即第25-32位）  
	d = (x>>24) & 255;
	// 将这四个字节按照相反的顺序重新组合成一个整数，实现大端序和小端序的转换 
	int ans = ((int)a<<24) + ((int)b<<16) + ((int)c<<8) + d;
	return ans;
}

/**  
 * @brief 获取最大值  
 *  
 * 从给定的双精度浮点数数组中找出最大值并返回。  
 *  
 * @param a 指向双精度浮点数数组的指针  
 * @param len 数组的长度（元素的数量）  
 *  
 * @return 数组中的最大值   
 */  
double getMax(double* a, int len)  
{  
	double smax = -DBL_MAX; // 初始化最大值为 double max，确保即使数组中包含负数，该函数仍然会返回最大的那个数
	assert(len>0); // 断言数组长度必须大于 0  
	for (int i = 0; i < len; i++)  
	{  
		// 使用三元运算符更新最大值  
		smax = a[i] > smax ? a[i] : smax;  
	}   
	return smax;  
}
/**  
 * @brief 计算 Softmax 函数值  
 *  
 * 对于给定的实数数组，计算其 Softmax 函数值，并返回一个新的数组，其中每个元素是输入数组中对应元素的 Softmax 值。  
 *  
 * @param num 输入的实数数组  
 * @param len 数组的长度（元素的数量）  
 *  
 * @return 指向计算得到的 Softmax 值数组的指针  
 *  
 * @note 返回的数组需要调用者在使用完毕后手动释放内存。  
 *       为了数值稳定性，在计算 Softmax 之前，先对数组中的最大值进行减去操作（称为 Shifted Softmax）。  
 *       此外，如果数组中包含极大的正数或极小的负数，可能会导致溢出或下溢，但在此实现中，通过减去最大值来减少溢出的可能性。  
 */  
double* softmax(double* num, int len)  
{  
    // 分配一个新的双精度浮点数数组来存储 Softmax 值  
    double* ans = new double[len];  
      
    // 断言数组长度必须大于 0  
    assert(len > 0);  
  
    // 复制输入数组到输出数组（初始时，两者相同）  
    for (int i = 0; i < len; i++)
	{  
        ans[i] = num[i];  
    }  
  
    // 数组元素的总和 与 最大值  
    double sum = 0, smax = getMax(ans, len);  
  
    // 对每个元素应用 Shifted Softmax 公式  
    for (int i = 0; i < len; i++)
	{  
        // 减去最大值后计算指数函数，避免上溢 
        ans[i] = exp(ans[i] - smax);  
        // 累加所有 exp() 的值到 sum 中  
        sum += ans[i];  
    }  
  
    // 归一化 Softmax 值  
    for (int i = 0; i < len; i++)
	{  
        ans[i] /= sum;  
    }  
  
    // 返回计算得到的 Softmax 值数组  
    return ans;  
}
/**  
 * @brief 矩阵乘法  
 *  
 * 执行两个二维数组的矩阵乘法运算，并返回结果矩阵。  
 *  
 * @param X 第一个矩阵，一个指向指针的指针，表示二维数组  
 * @param W 第二个矩阵，一个指向指针的指针，表示二维数组  
 * @param xrow 矩阵X的行数  
 * @param xcol 矩阵X的列数，同时也是矩阵W的行数（由断言保证）  
 * @param wrow 矩阵W的行数（实际上与xcol相同，但此参数在此函数中不使用）  
 * @param wcol 矩阵W的列数  
 *  
 * @return 指向结果矩阵的指针，一个指向指针的指针，表示二维数组  
 *  
 * @note 调用此函数前，应确保矩阵X和W的维度匹配（即X的列数等于W的行数）。  
 *       此外，返回的结果矩阵需要调用者在使用完毕后手动释放内存。  
 *       这个函数使用了断言来确保矩阵X的列数等于矩阵W的行数。  
 */  
double** matmul(double** X, double** W, int xrow, int xcol, int wrow, int wcol)  
{  
	// 断言以确保矩阵X的列数等于矩阵W的行数  
	assert(xcol == wrow);  
  
	// 分配结果矩阵的内存  
	double** ans = new double*[xrow];  
	for (int i = 0; i < xrow; i++)  
	{  
		ans[i] = new double[wcol];  
	}  
  
	// 遍历计算结果矩阵的每个元素  
	for(int i = 0; i < xrow; i++)  
	{  
		for (int j = 0; j < wcol; j++)  
		{  
			double sum = 0; // 初始化累加器  
  
			// 遍历矩阵X的第i行和矩阵W的第j列对应的元素，执行乘法并累加  
			for (int k = 0; k < xcol; k++)  
			{  
				double x = X[i][k]; // 从矩阵X中取出元素  
				sum += x * W[k][j]; // 累加乘法结果  
			}  
  
			// 将累加结果存储到结果矩阵的对应位置  
			ans[i][j] = sum;  
		}  
	}  
  
	// 返回结果矩阵  
	return ans;  
}
/**  
 * @brief 矩阵乘法与偏置项相加  
 *  
 * 对给定的输入矩阵X、权重矩阵W和偏置项b进行线性变换，即执行X*W+b的操作，  
 * 并返回结果矩阵。  
 *  
 * @param X 输入矩阵，大小为[batch_size, num_input]  
 * @param W 权重矩阵，大小通常为[num_input, num_output]
 * @param b 偏置项，大小为[num_output]  
 * @param batch_size 批量大小，即输入矩阵X的行数  
 * @param num_input 输入特征的维度  
 * @param num_output 输出特征的维度  
 *  
 * @return 指向结果矩阵的指针，大小为[batch_size, num_output]  
 *  
 * @note 调用此函数前，应确保输入矩阵X、权重矩阵W和偏置项b的维度正确匹配。  
 *       此外，返回的结果矩阵需要调用者在使用完毕后手动释放内存。  
 */  
double** xwpb(double** X, double** W, double* b, int batch_size, int num_input, int num_output)  
{  
	// 执行矩阵乘法X*W  
	double** o = matmul(X, W, batch_size, num_input, num_input, num_output); 
  
	// 将偏置项b加到结果矩阵o的每一行上  
	for (int i = 0; i < batch_size; i++) // 遍历批量中的每个样本  
	{  
		for(int j = 0; j < num_output; j++) // 遍历输出特征的每个维度  
		{  
			o[i][j] += b[j]; // 将偏置项加到结果矩阵的对应位置上  
		}  
	}  
  
	// 返回结果矩阵  
	return o;  
}

/**  
 * @brief Softmax回归函数  
 *  
 * 对给定的输入矩阵X、权重矩阵W和偏置项b执行线性变换（即XW+b），  
 * 然后对每个样本的输出应用Softmax函数，并返回包含Softmax结果的向量。  
 *  
 * @param X 输入矩阵，大小为[batch_size, num_input]  
 * @param W 权重矩阵，大小为[num_input, num_output]  
 * @param b 偏置项，大小为[num_output]  
 * @param batch_size 批量大小，即输入矩阵的行数  
 * @param num_input 输入特征的维度  
 * @param num_output 输出特征的维度（同时也是类别数）  
 *  
 * @return 返回一个向量，其中每个元素是一个指向double数组的指针，表示每个样本的Softmax输出  
 *  
 * @note 调用此函数前，应确保输入矩阵X、权重矩阵W和偏置项b的维度正确匹配。  
 *       返回的向量中的double指针数组（即Softmax结果）在使用完毕后需要手动释放内存。  
 *       函数内部调用了xwpb函数进行线性变换，并调用了softmax函数对每个样本的输出应用Softmax。  
 */  
vector<double*> sofreg(double** X, double** W, double* b, int batch_size, int num_input, int num_output)  
{  
	// 执行线性变换XW+b，并返回结果矩阵o  
	double** o = xwpb(X, W, b, batch_size, num_input, num_output);  
  
	// 创建一个大小为batch_size的向量y_hat，用于存储每个样本的Softmax输出  
	vector<double*> y_hat(batch_size);  
  
	// 遍历每个样本  
	for (int i = 0; i < batch_size; i++)  
	{  
		// 对当前样本的输出应用Softmax函数，并返回结果指针so  
		double* so = softmax(o[i], num_output);  
  
		// 将Softmax结果存储到y_hat向量的对应位置  
		y_hat[i] = so;  
	} 
	
	// 释放内存 
  	for(int i=0; i<batch_size; i++) delete[] o[i];
  	delete[] o;
  	
	// 返回包含每个样本Softmax输出的向量  
	return y_hat;  
}
/**  
 * @brief 交叉熵损失函数  
 *  
 * 计算给定预测值（经过Softmax处理后的概率分布）y_hat和实际标签y之间的交叉熵损失。  
 *  
 * @param y_hat 预测值向量，每个元素是一个指向double数组的指针，表示每个样本的Softmax输出  
 * @param y 实际标签数组，为0到9之间的整数
 * @param batch_size 批量大小，即y_hat和y中元素的数量  
 * @param num_output 输出特征的维度（同时也是类别数），在此为10（0-9的10个类别）  
 *  
 * @return 返回一个指向double数组的指针，数组大小为batch_size，表示每个样本的交叉熵损失  
 *  
 * @note 调用此函数前，应确保y_hat和y的长度相等，并且与batch_size匹配。  
 *       此外，y中的每个标签值应为0到num_output-1之间的整数。  
 *       函数内部使用了assert来检查y中的值是否在有效范围内，以及y_hat中对应位置的预测值是否在(0,1)之间。  
 *       返回的double数组需要调用者在使用完毕后手动释放内存。  
 */  
double* cross_entropy(vector<double*> y_hat, char* y, int batch_size, int num_output)  
{  
	// 分配一个大小为batch_size的double数组，用于存储每个样本的交叉熵损失  
	double* loss = new double[batch_size];  
  
	// 遍历每个样本  
	for (int i = 0; i < batch_size; i++)  
	{  
		int yi = y[i];
  
		// 使用assert断言来检查标签值是否在有效范围内（0-9）  
		assert(yi >= 0 && yi <= 9);  
  
		// 使用assert断言来检查y_hat中对应位置的预测值是否在(0,1)之间  
		assert(y_hat[i][yi] > 0 && y_hat[i][yi] < 1);  
  
		// 计算交叉熵损失，这里只考虑了单标签的情况，即每个样本只有一个类别标签  
		loss[i] = -log(y_hat[i][yi]);  
	}  
  
	// 返回包含每个样本交叉熵损失的double数组  
	return loss;  
}
/**
 * @brief sgd 函数用于执行随机梯度下降（Stochastic Gradient Descent）算法  
// 来更新神经网络中的权重 W 和偏置 b  
  
// 参数说明：  
// X: 输入数据，是一个二维数组（指针的指针），大小为 [batch_size][num_input]  
// y: 标签数据，是一个字符串（但实际上是标签的索引数组），大小为 [batch_size]  
// W: 权重矩阵，是一个二维数组（指针的指针），大小为 [num_input][num_output]  
// b: 偏置向量，是一个一维数组，大小为 [num_output]  
// lr: 学习率，用于控制权重更新的步长  
// batch_size: 批量大小，即每次用于梯度计算的样本数量  
// num_input: 输入数据的特征数量  
// num_output: 输出数据的类别数量（或神经元的数量）  
 */
void sgd(double** X, const char* y, double** W, double* b, double lr, int batch_size, int num_input, int num_output)
{
//	vector<double*> y_hat = sofreg(X, W, b, batch_size, num_input, num_output);
	// 计算线性组合的结果（未经过激活函数）  
	double** o=xwpb(X, W, b, batch_size, num_input, num_output);
	// 为权重梯度 gradw 和偏置梯度 gradb 分配内存  	
	double** gradw=new double*[num_input];
	double* gradb=new double[num_output];
	// 初始化权重梯度 gradw 为 0  
	for (int i=0; i<num_input; i++)
	{
		gradw[i] = new double[num_output];
		for (int j=0; j<num_output; j++)
			gradw[i][j]=0.0;
	}
	// 初始化偏置梯度 gradb 为 0
	for (int j=0; j<num_output; j++)
		gradb[j]=0.0;
	// 遍历批量中的每个样本，计算梯度  
	for (int i=0; i<batch_size; i++)
	{
		int yi = y[i];
		// 计算 softmax 函数的结果  
		double* so=softmax(o[i], num_output);
		// 计算 cross entropy 对 小批量的未规范化预测 O 的导数 
		// softmax(o)[j]-y[j]， 将 y 视为独热标签向量 
		double grad[num_output];
		for(int j=0; j<num_output; j++)
		{
			grad[j] = so[j];
		}
		grad[yi]-=1;
		
		// 计算 gradb , cross entropy 对 b 的导数，链式求导 
		// o = X * W + b 
		for (int j=0; j<num_output; j++)
		{
			gradb[j]+=grad[j];
		}
		
		// 计算 gradw ，cross entropy 对 W 的导数，链式求导 
		// o = X * W + b 
		for (int j=0; j<num_input; j++)
		{
			for (int k=0; k<num_output; k++)
			{
				double x=X[i][j];
				gradw[j][k] += grad[k]*x;
			}
		}
		
		delete[] so;
	}
	// 使用计算得到的梯度来更新权重 W 和偏置 b  
	for(int i=0; i<num_input; i++)
	{
		for (int j=0; j<num_output; j++)
		{
			W[i][j] = W[i][j] - lr * gradw[i][j] / batch_size;
		}
	}
	for (int i=0; i<num_output; i++)
	{
		b[i] = b[i] - lr * gradb[i]/ batch_size;
	}
	
	for (int i=0; i<batch_size; i++) delete[] o[i];
	delete[] o;
	
	for (int i=0; i<num_input; i++) delete[] gradw[i];
	delete[] gradw;
	
	delete[] gradb; 
}
/**  
 * @brief 计算平均值  
 *  
 * 计算给定双精度浮点数数组的平均值。  
 *  
 * @param loss 包含要计算平均值的双精度浮点数的数组  
 * @param len 数组的长度（元素的数量）  
 *  
 * @return 数组 `loss` 中所有元素的平均值  
 *  
 */  
double mean(double* loss, int len)  
{  
	double ans = 0; // 初始化累加器为 0  
	assert(len>0); // 断言数组长度必须大于 0  
	// 遍历数组 `loss` 中的每个元素  
	for (int i = 0; i < len; i++)  
	{  
		// 将当前元素加到累加器 `ans` 上  
		ans += loss[i];  
	}  
	  
	// 返回累加器 `ans` 除以数组长度 `len` 的结果，即平均值  
	return ans / len;  
}

unsigned char** read_mnist_image(string file_name, int& num_image, int& num_row, int& num_col, const int check_number);
char* read_mnist_label(string file_name, const int num_image, const int check_number);
unsigned char** get_image(string path, int& num_image, int& num_row, int& num_col, bool is_train);
char* get_label(string path, int num_image, bool is_train);
/**  
 * @brief 归一化图像数据  
 *  
 * 将输入的二维无符号字符数组（通常是灰度图像）归一化到 0 到 1 的范围内，  
 * 并返回一个二维双精度浮点数数组，其中包含了归一化后的图像数据。  
 *  
 * @param cX 输入的二维无符号字符数组，代表原始图像数据  
 * @param row 图像的行数  
 * @param col 图像的列数  
 *  
 * @return 指向归一化后二维双精度浮点数数组的指针  
 *  
 * @note 调用者需要确保输入的 cX 数组是有效且已经分配了足够的内存。  
 *       返回的 X 数组需要调用者在使用完毕后手动释放内存。  
 */  
double** normalization(unsigned char** cX, int row, int col)  
{  
	// 创建一个新的二维双精度浮点数数组 X 来存储归一化后的图像数据  
	double** X = new double*[row];  
	for(int i=0; i<row; i++)  
	{  
		X[i] = new double[col];  
	}  
  
	// 遍历原始图像数据的每个像素，并进行归一化  
	for (int i=0; i<row; i++)  
	{  
		for (int j=0; j<col; j++)  
		{  
			// 读取原始图像数据中的像素值  
			int x = cX[i][j];  
			// 归一化到 0 到 1 的范围  
			X[i][j] = x * 1.0 / 255.0;
		}  
	}  
  
	// 返回归一化后的图像数据  
	return X;  
}

/**  
 * @brief 打乱图像数据和标签的顺序  
 *  
 * 使用 Fisher-Yates 洗牌算法（也被称为 Knuth 洗牌）结合一个随机数生成器来  
 * 打乱传入的图像数据和对应的标签。 
 *  
 * @param X 指向图像数据的指针数组，每个元素指向一个图像（一维数组）  
 * @param y 指向标签数据的指针，每个元素表示一个标签  
 * @param num_image 图像和标签的数量  
 *  
 * @note  此函数会直接修改传入的 X 和 y，而不需要额外的存储空间。  
 */  
void shuffle(unsigned char** X, char* y, int num_image)  
{  
    // 创建一个整数向量 num，用于存储原始索引  
    vector<int> num(num_image);  
    for(int i = 0; i < num_image; i++) num[i] = i;  
  
    // 使用当前时间作为随机数生成器的种子  
    // 这样可以确保每次调用 shuffle 函数时都能得到不同的随机序列  
    random_device rd;    
    mt19937 g(rd()); // 使用 Mersenne Twister 算法来生成随机数  
  
    // 打乱整数向量 num 中的元素顺序  
    shuffle(num.begin(), num.end(), g);  
  
    // 使用 Fisher-Yates 洗牌算法来打乱图像数据和标签的顺序  
    unsigned char* tmpcp; // 临时指针，用于交换图像数据  
    char tmpc;            // 临时字符，用于交换标签  
    for (int i = 0; i < num_image; i++)  
    {  
        // 交换图像数据  
        tmpcp = X[i];  
        X[i] = X[num[i]];  
        X[num[i]] = tmpcp;  
  
        // 交换标签数据  
        tmpc = y[i];  
        y[i] = y[num[i]];  
        y[num[i]] = tmpc;  
    }  
}

int main()
{
	// 定义数据集的路径  
	string path="../data/MNIST/raw/";
	// 定义变量来存储图像和标签的数量以及尺寸  
	// 训练图像的数量、像素行数和列数（高和宽） 
	int num_image, num_row, num_col;
	// 测试图像的数量、像素行数和列数  
	int num_test_image, num_test_row, num_test_col;
	// 从指定路径读取训练集与测试集图像，并返回图像数据和图像数量以及像素宽高 
	unsigned char**      cX = get_image(path, num_image,      num_row,      num_col,      true);
	unsigned char** test_cX = get_image(path, num_test_image, num_test_row, num_test_col, false);
	// 从指定路径加载标签  
	char*      y = get_label(path, num_image,      true);
	char* test_y = get_label(path, num_test_image, false);	
	// 对训练数据和标签进行随机打乱  
	shuffle(cX, y, num_image);
	// 对图像数据进行归一化处理，并返回处理后的数据  
	double** X=normalization(cX, num_image, num_row*num_col);
	double** test_X=normalization(test_cX, num_test_image, num_test_row*num_test_col);	
	
	// 定义超参数  
	const double lr = 0.01;// 学习率 
	const int num_epochs = 10;// 训练轮数  
	const int num_output = 10;// 输出层神经元数量（对应MNIST的10个类别） 
	const int batch_size = 256;// 批量大小
	const int num_sample = num_image;// 总样本数（这里等于训练样本数） 
	const int num_input = num_row * num_col;	// 输入层神经元数量（等于图像的像素数） 	
	// 初始化权重矩阵W和偏置向量b  
	double** W=new double* [num_input];
	for (int i=0; i<num_input; i++) W[i]=new double[num_output];
	double* b=new double[num_output];
	// 将W和b的所有元素初始化为0.0  
	for(int i=0; i<num_input; i++)
	{
		for (int j=0; j<num_output; j++)
		{
			W[i][j]=0.0;
		}
	}
	for (int j=0; j<num_output; j++)
	{
		b[j]=0.0;
	}
	
	// 开始进行训练循环，迭代num_epochs次  
	for (int epoch=0; epoch<num_epochs; epoch++)
	{
		// 对所有样本进行迭代，每次处理batch_size个样本  
		for (int j=0; j<num_sample; j+=batch_size)
		{
			// 确保每一批量获得正确的样本个数 
			int batch = min(batch_size, num_sample-j);
			// 对当前batch的数据进行softmax回归计算，得到预测结果y_hat  
			vector<double*> y_hat = sofreg(X+j, W, b, batch, num_input, num_output);
			// 计算当前batch的交叉熵损失 
			double* loss = cross_entropy(y_hat, y+j, batch, num_output);
			// 使用随机梯度下降（SGD）更新权重W和偏置b  
			sgd(X+j, y+j, W, b, lr, batch, num_input, num_output);
			
			delete[] loss;
			for (auto i:y_hat) delete[] i;
			y_hat.clear();
		}
		// 在每个epoch结束后，测试模型在测试集上的性能  
		{
			// 初始化索引和当前batch的大小（对于测试集，这里通常使用整个测试集）  
			int j=0;
			// 但因为测试集通常全部使用，所以batch_size可能不会被限制 
			int batch = min(batch_size, num_test_image-j);
			// 对测试集进行softmax回归计算，得到预测结果y_hat  
			vector<double*> y_hat = sofreg(test_X+j, W, b, batch, num_input, num_output);
			// 初始化预测正确的样本数  
			int right_num=0;
			// 遍历当前batch的所有样本 
			for (int i=0; i<batch; i++)
			{
				// 获取当前样本的预测结果 
				double* yy = y_hat[i];
				double mm=0, id=-1;
				// 找到预测概率最大的类别  
				for (int j=0; j<num_output; j++)
				{
					if (yy[j]>mm) mm=yy[j], id=j;
				}
				// 检查预测类别是否与实际类别相同，如果相同则增加正确数
				if (id == (test_y+j)[i]) right_num++;
			}
			// 计算并打印当前epoch的测试集准确率
			double* loss = cross_entropy(y_hat, test_y+j, batch, num_output);
			printf("in epoch %d, accuracy is %.4Lf\n", epoch+1, right_num*1.0/batch*1.0);
			delete[] loss;
			for (auto i:y_hat) delete[] i;
			y_hat.clear();
		}	
	}
	
	// 累了，交给操作系统自己释放吧 
	//delete cX, test_cX, y, test_y, X, test_X, w, b;
}

/*******************************************
// 读取MNIST数据集图像的函数  
// 参数：  
// file_name: 图像文件的名字，需要绝对或相对路径    
// num_image: 读取的图像数量（引用传递，用于修改外部变量）  
// num_row: 每张图像的行数（引用传递，用于修改外部变量）  
// num_col: 每张图像的列数（引用传递，用于修改外部变量）  
// check_number: 用于检查文件头部magic number的期望值  
// 返回值：  
// 返回一个二维指针，指向由unsigned char数组组成的图像数组 
// 第一个维度是图片数量，第二个维度是单张图片大小 
// 注意：调用此函数的代码应确保在适当的时候释放images指向的内存，避免内存泄漏 
********************************************/
unsigned char** read_mnist_image(string file_name, int& num_image, int& num_row, int& num_col, const int check_number)
{
	// 以二进制读模式打开文件  
	FILE *fp = fopen(file_name.c_str(), "rb");
	// 如果文件打开失败，退出程序
	if (!fp)
	{
		printf("file open fail!\n");
		exit(0);
	}
	
	// 读取magic number、图像数量、图像的行数和列数 
	int magic_number;
	fread((char*)&magic_number, sizeof(magic_number), 1, fp);
	fread((char*)&num_image, sizeof(num_image), 1, fp);
	fread((char*)&num_row, sizeof(num_row), 1, fp);
	fread((char*)&num_col, sizeof(num_col), 1, fp);
	//由于MNIST文件是以大端字节序存储的，所以需要转换为小端序 
	magic_number=reverseInt(magic_number);
    num_image=reverseInt(num_image);
    num_row=reverseInt(num_row);
    num_col=reverseInt(num_col);

    // 检查magic number是否匹配  
    if (check_number != magic_number)
    {
    	printf("magic number is error, this is not the right image file\n");
    	fclose(fp); // 关闭文件句柄  
    	exit(0); // 退出程序  
	}
	
	// 分配二维数组以存储图像  
	unsigned char** images=new unsigned char*[num_image];
	// 读取所有图像
	for(int i=0; i<num_image; i++)
	{
		// 为每个图像分配内存  
		unsigned char* image=new unsigned char[num_row * num_col];
		// 读取图像数据，
		fread(image, sizeof(unsigned char), num_row * num_col, fp);
		// 将图像数据存入二维数组 
		images[i]=image;
	}
	// 关闭文件句柄  
	fclose(fp);
	// 返回二维图像指针 
	return images;
	
	// 示例，使用delete[]来释放每个图像的内存，并最后释放images本身
	// for (int i = 0; i < num_image; ++i) {  
    //     delete[] images[i];  
    // }  
    // delete[] images;  
}

/*************************************
// 读取MNIST数据集标签的函数  
// 参数：  
// file_name: 标签文件的名字，需要绝对或相对路径  
// num_image: 预期读取的标签数量（应与文件内标签数量一致）  
// check_number: 用于检查文件头部magic number的期望值，检查文件是否正确  
// 返回值：  
// 返回一个包含标签的char数组指针，此处char应理解为单字节类型整数  
// 注意：调用此函数的代码应确保在适当的时候释放labels指向的内存，避免内存泄漏 
***************************************/
char* read_mnist_label(string file_name, const int num_image, const int check_number)
{
	// 以二进制读模式打开文件  
	FILE *fp = fopen(file_name.c_str(), "rb");
	// 如果文件打开失败，退出程序
	if (!fp)
	{
		printf("file open fail!\n");
		exit(-1);
	}
	
	// 定义并读取magic number和标签数量  
	int magic_number, num_label;
	fread((char*)&magic_number, sizeof(magic_number), 1, fp);
	fread((char*)&num_label, sizeof(num_label), 1, fp);
	//由于MNIST文件是以大端字节序存储的，所以需要转换为小端序 
	magic_number=reverseInt(magic_number);
    num_label=reverseInt(num_label);
    
    // 检查magic number是否匹配  
    if (check_number != magic_number)
    {
    	printf("magic number is error, this is not the right label file!\n");
    	fclose(fp);
    	exit(-1);
	}
	// 检查标签数量是否与预期一致  
	if (num_label!=num_image)
	{
		printf("num_label not equal num_image!\n");
		fclose(fp);
    	exit(-1);
	}
	
	// 动态分配内存以存储标签  
    char* labels=new char[num_label];
    // 读取所有标签 
    for(int i=0; i<num_label; i++)
    {
    	fread(&labels[i], sizeof(char), 1, fp);
	}
	// 关闭文件句柄  
    fclose(fp);
    // 返回标签数组指针
	return labels;
	
	// 示例，使用delete[]来释放标签的内存
	//delete[] labels; 
}

/**  
 * @brief 获取 MNIST 数据集的图像数据  
 *  
 * 根据指定的文件路径和是否训练数据集的标志，从 MNIST 数据集中加载图像数据，  
 * 并返回指向图像数据的指针（二维数组）。同时，更新图像数量、行数和列数的引用参数。  
 *  
 * @param path 数据集所在的路径  
 * @param num_image 引用参数，用于返回图像数量  
 * @param num_row 引用参数，用于返回每个图像的行数  
 * @param num_col 引用参数，用于返回每个图像的列数  
 * @param is_train 是否为训练数据集的标志，true 为训练数据，false 为测试数据  
 *  
 * @return 指向图像数据的指针（二维数组），每个元素为 unsigned char 类型  
 */  
unsigned char** get_image(string path, int& num_image, int& num_row, int& num_col, bool is_train)
{
	// 定义 MNIST 数据集的文件名  
	string name_train_image="train-images-idx3-ubyte";
	string name_train_label="train-labels-idx1-ubyte";
	string name_test_image="t10k-images-idx3-ubyte";
	string name_test_label="t10k-labels-idx1-ubyte";
	// 根据是否训练数据集的标志，选择加载训练或测试数据集的图像文件  
	if (is_train) {
		// 加载训练数据集的图像文件  
		return read_mnist_image(path+name_train_image, num_image, num_row, num_col, 2051);
	} else {
		// 加载测试数据集的图像文件  
		return read_mnist_image(path+name_test_image, num_image, num_row, num_col, 2051);
	}
}

/**  
 * @brief 获取 MNIST 数据集的标签数据  
 *  
 * 根据给定的路径、图像数量和是否训练数据集的标志，从 MNIST 数据集中加载标签数据，  
 * 并返回指向标签数据的指针（一维字符数组）。  
 *  
 * @param path 数据集所在的路径  
 * @param num_image 预期的标签数量，用于检查文件标签数量是否与预期一致
 * @param is_train 是否为训练数据集的标志，true 为训练数据，false 为测试数据  
 *  
 * @return 指向标签数据的指针（一维字符数组），每个元素表示一个标签  
 */  
char* get_label(string path, const int num_image, bool is_train)
{
	// 定义 MNIST 数据集的文件名 
	string name_train_image="train-images-idx3-ubyte";
	string name_train_label="train-labels-idx1-ubyte";
	string name_test_image="t10k-images-idx3-ubyte";
	string name_test_label="t10k-labels-idx1-ubyte";
	// 根据是否训练数据集的标志，选择加载训练或测试数据集的标签文件
	if (is_train) {
		// 加载训练数据集的标签文件
		return read_mnist_label(path+name_train_label, num_image, 2049);
	} else {
		// 加载测试数据集的标签文件  
		return read_mnist_label(path+name_test_label, num_image, 2049);
	}
}
```